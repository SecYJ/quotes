import { DetailedError, hc, parseResponse } from 'hono/client'
import type { ClientResponse } from 'hono/client'
import type { AppType } from 'server'

// 同源呼叫：开发时经 Vite proxy，部署后由同一个 Worker 处理
export const api = hc<AppType>('/').api

// 送出请求并取出成功时的资料；失败时丢出带中文讯息的 Error，交给 ErrorNotice / 表单显示。
// 回传类型由 parseResponse 依 server 的路由推导（只取 2xx 的 body）
export async function request<T extends ClientResponse<unknown>>(call: Promise<T>) {
    try {
        return await parseResponse(call)
    } catch (error) {
        throw new Error(errorMessage(error), { cause: error })
    }
}

function errorMessage(error: unknown) {
    if (error instanceof DetailedError) {
        // server 的错误一律是 { error: '<中文说明>' }（见 server/src/validation.ts、index.ts）
        const data = (error.detail as { data?: unknown } | undefined)?.data
        if (isErrorBody(data)) return data.error
        return `服务器回应 ${error.statusCode ?? '错误'}`
    }
    // fetch 本身失败：断网、dev server 没开
    return '连不上服务器'
}

function isErrorBody(data: unknown): data is { error: string } {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof (data as { error?: unknown }).error === 'string'
    )
}
