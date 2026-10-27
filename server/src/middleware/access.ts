import { createRemoteJWKSet, jwtVerify } from 'jose'
import { createMiddleware } from 'hono/factory'

// Cloudflare Access 放行请求时，会在 Cf-Access-Jwt-Assertion header 带一张用 Cloudflare 私钥签名的 JWT。
// 这里用公开的公钥（JWKS）验证签名、issuer（你的 team）与 audience（这个 Access 应用），
// 就算 Access 设定出错或有人绕过它，写入 API 也不会放行。
// 文档：https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/

// createRemoteJWKSet 会快取公钥，放在模块层级让同一个 isolate 的请求共用
let jwks: { teamDomain: string; keySet: ReturnType<typeof createRemoteJWKSet> } | undefined

function getKeySet(teamDomain: string) {
    if (jwks?.teamDomain !== teamDomain) {
        const keySet = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`))
        jwks = { teamDomain, keySet }
    }
    return jwks.keySet
}

export const requireAccess = createMiddleware<{ Bindings: Env }>(async (c, next) => {
    // 本地没有 Access：只有 dev script 用 --var 注入这个值，部署不会带上
    if (c.env.ACCESS_DEV_BYPASS === 'true') return next()

    const teamDomain = c.env.ACCESS_TEAM_DOMAIN
    const audience = c.env.ACCESS_AUD
    // 没设定就一律拒绝，不会因为漏设而放行
    if (!teamDomain || !audience) {
        console.error('ACCESS_TEAM_DOMAIN / ACCESS_AUD 未设定，写入 API 一律拒绝')
        return c.json({ error: '没有权限' }, 403)
    }

    const token = c.req.header('Cf-Access-Jwt-Assertion')
    if (!token) return c.json({ error: '没有权限' }, 403)

    try {
        await jwtVerify(token, getKeySet(teamDomain), { issuer: teamDomain, audience })
    } catch {
        return c.json({ error: '没有权限' }, 403)
    }
    await next()
})
