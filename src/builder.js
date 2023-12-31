import { lookup } from 'mrmime'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, isAbsolute, join, resolve } from 'node:path'
import { defineModule } from './lib/module.js'
import { createRouter } from './lib/router.js'
import { createContext } from 'esbuild-multicontext'
import { GLOBALS } from './constants.js'

let _routeConfig = {}
const nomenCache =
  GLOBALS.NOMEN_CACHE in global ? global[GLOBALS.NOMEN_CACHE] : {}

export default async function defineRoutes(routeConfig) {
  _routeConfig = routeConfig
}

defineModule({
  name: 'nomen:builder',
  dependsOn: ['nomen:root', 'nomen:internal:html:head'],
  async onLoad(ctx) {
    const router = createRouter()

    ctx.builder = createContext()
    ctx.router = router
    ctx.routerEntries = []

    for (let key of Object.keys(_routeConfig)) {
      let urlPath = key

      const importFnString = _routeConfig[key].toString()

      const filePath = importFnString.match(/(import)\(["'](.*)["']\)/)[2]
      const modulePath = isAbsolute(filePath)
        ? filePath
        : resolve(ctx.projectRoot, filePath)

      const importModule = () => import(`${modulePath}?${Date.now()}`)
      const module = await importModule()

      ctx.routerEntries.push({
        path: modulePath,
        module,
        transformedSource: nomenCache[resolve(ctx.projectRoot, filePath)],
      })

      router.add('all', urlPath, module, {
        path: resolve(ctx.projectRoot, filePath),
        reimportModule: importModule,
      })
    }

    // handle assets
    for (let asset of ctx.options.assets) {
      const assetURL = join('/', asset.baseURL, '**')
      router.add('all', assetURL, staticServe(ctx, asset, dirname(asset.dir)), {
        disableMiddleware: true,
      })
    }
  },
})

function jsToModuleString(code) {
  return (
    'data:text/javascript;base64,' + Buffer.from(code).toString('base64url')
  )
}

function staticServe(ctx, asset, basePath) {
  return (context, params) => {
    const method = context.request.method
    const fpath = params.join('/')
    // don't have to handle for requests that aren't GET / HEAD
    if (method !== 'GET' && method !== 'HEAD')
      return new Response(undefined, {
        status: 405,
      })

    if (method === 'HEAD')
      // If HEAD, then just end the response without changing status
      return new Response('', {
        status: 200,
      })

    const possiblePath = join(basePath, asset.dir, fpath)

    if (!existsSync(possiblePath))
      return new Response('Not found', {
        status: 404,
      })

    const stat = statSync(possiblePath)
    const st = createReadStream(possiblePath)
    const mimeType = lookup(extname(possiblePath))

    return new Response(st, {
      headers: {
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Type': mimeType,
      },
    })
  }
}
