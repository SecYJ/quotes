import { hc } from 'hono/client'
import type { AppType } from 'server'

// 同源呼叫：开发时经 Vite proxy，部署后由同一个 Worker 处理
export const api = hc<AppType>('/').api
