// 名句上的复制按钮：只把内容放进剪贴板，图标短暂换成结果
const RESET_MS = 1600

export function startCopy() {
    const status = document.querySelector<HTMLElement>('[data-copy-status]')!

    document.addEventListener('click', async (e) => {
        const button = (e.target as Element).closest<HTMLButtonElement>('[data-copy]')
        if (!button) return
        let state = 'done'
        try {
            await navigator.clipboard.writeText(button.dataset.copy!)
        } catch {
            state = 'failed'
        }
        button.dataset.state = state
        status.textContent = state === 'done' ? '已复制' : '复制失败'
        clearTimeout(Number(button.dataset.timer))
        button.dataset.timer = String(
            setTimeout(() => {
                delete button.dataset.state
                status.textContent = ''
            }, RESET_MS),
        )
    })
}
