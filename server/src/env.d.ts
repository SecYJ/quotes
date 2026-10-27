// wrangler types 不知道的变数，补进 Env。
// ACCESS_DEV_BYPASS 只由 package.json 的 dev script（wrangler dev --var）注入，部署后不存在
interface Env {
    ACCESS_DEV_BYPASS?: string
}
