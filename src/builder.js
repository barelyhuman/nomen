import esbuild from 'esbuild'
import { dirname, extname, join } from 'node:path'
import { defineModule } from './lib/module.js'
import { createRouter } from './lib/router.js'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { lookup } from 'mrmime'

let _routeConfig = {}

export default async function defineRoutes(routeConfig) {
  _routeConfig = routeConfig
}

defineModule({
  name: 'nomen:builder',
  dependsOn: ['nomen:root'],
  async onLoad(ctx) {
    const router = createRouter()
    ctx.router = router

    const chunkOut = join(ctx.projectRoot, ctx.nomenOut, 'route-chunks')

    const allEntries = Object.keys(_routeConfig).map(key => ({
      source: join(ctx.projectRoot, _routeConfig[key]),
      dist: _routeConfig[key].replace(dirname(_routeConfig[key]), chunkOut),
    }))

    ctx.routerEntries = allEntries

    const esbuildConfig = ctx.esbuildConfig || {}
    const plugins = esbuildConfig.plugins || []

    await esbuild.build({
      entryPoints: allEntries.map(x => x.source),
      bundle: true,
      platform: 'node',
      format: 'esm',
      splitting: true,
      outdir: chunkOut,
      ...esbuildConfig,
      plugins,
    })

    for (let key of Object.keys(_routeConfig)) {
      let urlPath = key
      const _path = _routeConfig[key].replace(
        dirname(_routeConfig[key]),
        chunkOut
      )
      const handler = await import(_path)
      router.add('all', urlPath, handler, {
        path: _routeConfig[key],
        outfile: _path,
      })
    }

    // hidden handler for managing assets
    router.add(
      'all',
      '/.nomen/**',
      (context, params) => {
        const method = context.request.method
        const fpath = params.join('/')
        // don't have to handle for requests that aren't GET / HEAD
        if (method !== 'GET' && method !== 'HEAD') {
          return new Response(undefined, {
            status: 405,
          })
        }

        if (method == 'HEAD') {
          // If HEAD, then just end the response without changing status
          return new Response('', {
            status: 200,
          })
        }

        const resourcePath = join(
          ctx.projectRoot,
          '.nomen/client-chunks',
          fpath
        )

        const possiblePath = join(ctx.projectRoot, '.nomen', fpath)

        if (!existsSync(possiblePath)) {
          return new Response('Not found', {
            status: 404,
          })
        }

        const stat = statSync(possiblePath)
        const st = createReadStream(join(ctx.projectRoot, '.nomen', fpath))
        const mimeType = lookup(extname(resourcePath))

        return new Response(st, {
          headers: {
            'Content-Length': stat.size,
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Type': mimeType,
          },
        })
      },
      {
        disableMiddleware: true,
      }
    )
  },
})
