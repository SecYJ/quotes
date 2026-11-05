#!/usr/bin/env node
// Lines 验证用的 helper：up / doctor / drive / down
// 用法见 .claude/skills/verify/SKILL.md
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
const STATE = path.join(REPO, 'tmp', 'verify')
const RUNS = path.join(STATE, 'runs')
const PID_FILE = path.join(STATE, 'dev.pid')
const LOG_FILE = path.join(STATE, 'dev.log')
const BASE_URL = 'http://localhost:5173'
const PORTS = [5173, 8787]
const SEEDED_QUOTES = 12
const PLAYWRIGHT_VERSION = '1.63.0'
const TOOLS = path.join(os.tmpdir(), `lines-verify-playwright-${PLAYWRIGHT_VERSION}`)
const isWin = process.platform === 'win32'

const [command, ...args] = process.argv.slice(2)
const commands = { up, doctor, drive, down, __supervise }
if (!commands[command]) {
    console.error('用法: node .claude/skills/verify/scripts/lines.mjs <up|doctor|drive|down>')
    process.exit(2)
}
process.exitCode = (await commands[command](args)) ?? 0

// ---------- up ----------

async function up() {
    mkdirSync(STATE, { recursive: true })
    if (ourPid()) {
        console.log(`已经有本 helper 启动的 dev server（pid ${ourPid()}），直接检查：`)
        return doctor()
    }
    for (const port of PORTS) {
        if (await portBusy(port)) {
            console.error(
                `port ${port} 已被占用，而且不是本 helper 启动的（可能是使用者自己的 pnpm dev）。` +
                    '不要 kill 它：请使用者先关掉，或问使用者是否直接使用那个 instance。',
            )
            return 1
        }
    }
    if (!existsSync(path.join(REPO, 'node_modules'))) run('pnpm', ['install'])
    run('pnpm', ['--filter', 'server', 'db:migrate:local'])
    run('pnpm', ['--filter', 'server', 'db:seed:local'])

    // 由 detached 的 supervisor 启动 pnpm dev：
    // - 不 detached 的话，agent 的 shell 指令一结束 dev server 就被一起杀掉
    // - 直接 detached 启动 pnpm 的话，Windows 上 pnpm 转交给 repo 指定版本时会开新的 console，log 收不到
    const supervisor = spawn(process.execPath, [fileURLToPath(import.meta.url), '__supervise'], {
        cwd: REPO,
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
    })
    supervisor.unref()
    writeFileSync(PID_FILE, String(supervisor.pid))
    console.log(`pnpm dev 已启动（pid ${supervisor.pid}），log：${LOG_FILE}`)

    const deadline = Date.now() + 120_000
    while (Date.now() < deadline) {
        const state = await readiness()
        if (state.ready) {
            console.log(`READY ${BASE_URL}（${state.quotes} 句名句）`)
            return 0
        }
        await sleep(1000)
    }
    console.error('120 秒内没有 ready。dev.log 最后几行：')
    console.error(tail(LOG_FILE, 30))
    await down()
    return 1
}

// 只由 up 呼叫：活到 pnpm dev 结束为止，down 杀这个 process tree
function __supervise() {
    const log = openSync(LOG_FILE, 'w')
    const child = spawn('pnpm dev', {
        cwd: REPO,
        shell: true,
        stdio: ['ignore', log, log],
        windowsHide: true,
    })
    return new Promise((resolve) => child.on('exit', (code) => resolve(code ?? 1)))
}

// 「能用」= 页面有 root、API 经过 Vite proxy 回应、D1 已经是 seed 的资料
async function readiness() {
    const html = await get(`${BASE_URL}/`, 'text')
    const health = await get(`${BASE_URL}/api/health`)
    const quotes = await get(`${BASE_URL}/api/quotes`)
    const ready =
        typeof html === 'string' &&
        html.includes('id="root"') &&
        health?.ok === true &&
        Array.isArray(quotes)
    return { ready, html: typeof html === 'string', health, quotes: quotes?.length }
}

// ---------- doctor ----------

async function doctor() {
    const pid = ourPid()
    const ports = Object.fromEntries(
        await Promise.all(PORTS.map(async (p) => [p, await portBusy(p)])),
    )
    const state = await readiness()
    const bypass = await writeBypassStatus()
    const head = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO, encoding: 'utf8' })
    const dirty = spawnSync('git', ['status', '--porcelain'], { cwd: REPO, encoding: 'utf8' })

    const rows = [
        ['本 helper 启动的', pid ? `是（pid ${pid}）` : '否'],
        ['port 5173 / 8787', `${ports[5173] ? '有' : '无'} / ${ports[8787] ? '有' : '无'}`],
        [
            '页面 / health',
            `${state.html ? 'ok' : '无回应'} / ${state.health?.ok ? 'ok' : '无回应'}`,
        ],
        ['名句数', state.quotes ?? '读不到'],
        ['写入 API dev bypass', bypass ? '有' : '没有（写入会 403，或 server 没回应）'],
        ['git', `${head.stdout.trim()}${dirty.stdout.trim() ? '（有未 commit 的修改）' : ''}`],
    ]
    for (const [k, v] of rows) console.log(`${k.padEnd(20)} ${v}`)

    const ok = pid && state.ready && bypass
    console.log(ok ? 'DOCTOR OK' : 'DOCTOR FAIL')
    if (state.ready && state.quotes !== SEEDED_QUOTES) {
        console.log(
            `注意：名句数不是 seed 的 ${SEEDED_QUOTES} 句，资料被改过。需要基准状态就 down 再 up。`,
        )
    }
    return ok ? 0 : 1
}

// 送一个空的 body 给写入 API：access 通过时 zod 验证回 400，不通过回 403。资料不会被写入
async function writeBypassStatus() {
    try {
        const res = await fetch(`${BASE_URL}/api/admin/quotes`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{}',
            signal: AbortSignal.timeout(3000),
        })
        return res.status === 400
    } catch {
        return false
    }
}

// ---------- drive ----------

async function drive(argv) {
    const journeyPath = argv.find((a) => !a.startsWith('--'))
    const name = flag(argv, 'name') ?? path.basename(journeyPath ?? 'journey', '.mjs')
    const theme = flag(argv, 'theme') ?? 'light'
    if (!journeyPath) {
        console.error('用法: lines.mjs drive <journey.mjs> [--name <label>] [--theme light|dark]')
        return 2
    }
    if (!(await readiness()).ready) {
        console.error(`${BASE_URL} 没有 ready，先跑 up（或 doctor 看原因）`)
        return 1
    }

    const { chromium, expect } = await loadPlaywright()
    const runDir = path.join(RUNS, `${timestamp()}-${name}`)
    mkdirSync(runDir, { recursive: true })

    const steps = []
    const consoleErrors = []
    const browser = await chromium.launch()
    const context = await browser.newContext({
        viewport: { width: 3440, height: 1300 },
        colorScheme: theme === 'dark' ? 'dark' : 'light',
        baseURL: BASE_URL,
    })
    const page = await context.newPage()
    page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(`console: ${msg.text()}`)
    })
    page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`))

    let shotIndex = 0
    const shot = async (label) => {
        const base = `${String(++shotIndex).padStart(2, '0')}-${label}`
        await page.screenshot({ path: path.join(runDir, `${base}.png`) })
        writeFileSync(
            path.join(runDir, `${base}.aria.txt`),
            await page.locator('body').ariaSnapshot(),
        )
        steps.push({ shot: base })
    }
    const step = (text) => {
        console.log(`• ${text}`)
        steps.push({ step: text })
    }
    const api = (p) => get(`${BASE_URL}${p}`)

    let error
    try {
        const journey = await import(pathToFileURL(path.resolve(journeyPath)).href)
        await journey.default({ page, expect, shot, step, api })
    } catch (err) {
        error = err
        await shot('failure').catch(() => {})
    } finally {
        await browser.close()
    }

    const status = error ? 'FAIL' : consoleErrors.length > 0 ? 'FAIL (console errors)' : 'PASS'
    const report = {
        journey: path.resolve(journeyPath),
        theme,
        status,
        error: error ? String(error.stack ?? error) : null,
        consoleErrors,
        steps,
    }
    writeFileSync(path.join(runDir, 'report.json'), JSON.stringify(report, null, 2))
    if (error) console.error(String(error.stack ?? error))
    for (const e of consoleErrors) console.error(e)
    console.log(`${status}  evidence: ${runDir}`)
    return status === 'PASS' ? 0 : 1
}

async function loadPlaywright() {
    const entry = path.join(TOOLS, 'node_modules', '@playwright', 'test', 'index.mjs')
    if (!existsSync(entry)) {
        console.log(`第一次使用：安装 @playwright/test@${PLAYWRIGHT_VERSION} 到 ${TOOLS}`)
        mkdirSync(TOOLS, { recursive: true })
        writeFileSync(path.join(TOOLS, 'package.json'), '{"private":true}')
        run('npm', [
            'install',
            '--no-save',
            '--prefix',
            TOOLS,
            `@playwright/test@${PLAYWRIGHT_VERSION}`,
        ])
    }
    // 已经下载过的浏览器会跳过
    run(
        process.execPath,
        [path.join(TOOLS, 'node_modules', 'playwright', 'cli.js'), 'install', 'chromium'],
        {
            quiet: true,
        },
    )
    return import(pathToFileURL(entry).href)
}

// ---------- down ----------

async function down() {
    const pid = ourPid()
    if (!pid) {
        console.log('没有本 helper 启动的 dev server，什么都不做。')
        rmSync(PID_FILE, { force: true })
        return 0
    }
    if (isWin) {
        spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
        try {
            process.kill(-pid, 'SIGTERM')
        } catch {}
    }
    rmSync(PID_FILE, { force: true })
    for (let i = 0; i < 30; i++) {
        if (!(await portBusy(5173)) && !(await portBusy(8787))) break
        await sleep(500)
    }
    console.log(`已停止 pid ${pid}。证据留在 ${RUNS}`)
    return 0
}

// ---------- 小工具 ----------

function ourPid() {
    if (!existsSync(PID_FILE)) return null
    const pid = Number(readFileSync(PID_FILE, 'utf8'))
    try {
        process.kill(pid, 0)
        return pid
    } catch {
        return null
    }
}

function portBusy(port) {
    return new Promise((resolve) => {
        const socket = net.connect({ host: 'localhost', port })
        socket.setTimeout(1000)
        socket.once('connect', () => (socket.destroy(), resolve(true)))
        socket.once('timeout', () => (socket.destroy(), resolve(false)))
        socket.once('error', () => resolve(false))
    })
}

async function get(url, as = 'json') {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
        if (!res.ok) return null
        return as === 'json' ? await res.json() : await res.text()
    } catch {
        return null
    }
}

function run(cmd, argv, { quiet = false } = {}) {
    // Windows 要经过 shell 才找得到 pnpm.cmd / npm.cmd；参数都是这个档案里写死的，不含外部输入
    const useShell = isWin && cmd !== process.execPath
    const res = spawnSync(useShell ? [cmd, ...argv].join(' ') : cmd, useShell ? [] : argv, {
        cwd: REPO,
        shell: useShell,
        stdio: quiet ? 'pipe' : 'inherit',
        encoding: 'utf8',
    })
    if (res.status !== 0) {
        if (quiet) console.error(res.stdout, res.stderr)
        throw new Error(`失败：${cmd} ${argv.join(' ')}（exit ${res.status}）`)
    }
}

function flag(argv, name) {
    const i = argv.indexOf(`--${name}`)
    return i === -1 ? undefined : argv[i + 1]
}

function tail(file, n) {
    if (!existsSync(file)) return '(没有 log)'
    return readFileSync(file, 'utf8').split('\n').slice(-n).join('\n')
}

function timestamp() {
    const d = new Date()
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms))
}
