import './builder.js'
import './handlers.js'
import './head/module.js'
import './kernel.js'
import { defineModule, loadModules } from './lib/module.js'
import './socket/module.js'
import './watcher.js'

import fs from 'node:fs'

import { compose } from '@hattip/compose'

export { defineModule }

import { defu } from 'defu'
import { join } from 'node:path'
import defineRoutes from './builder.js'
import { defaultConfig } from './lib/config.js'

const nomenAsset = {
  baseURL: '.nomen',
  dir: '.nomen',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

/**
 *
 * @param {typeof defaultConfig} options
 * @returns
 */
export function createNomen(options = {}) {
  const mergedConfig = defu(options, defaultConfig)
  const { routes, modules, client = {} } = mergedConfig

  mergedConfig.assets.push(nomenAsset)

  const kernel = {
    options: mergedConfig,
    client: client,
    env: process.env,
  }

  defineRoutes(routes)

  return {
    boot: async server => {
      modules.forEach(mod => {
        mod()
      })
      kernel.server = server
      await loadModules(kernel)
      if (kernel.env.NOMEN_DEV) await kernel.builder.watch()

      if (
        (process.env.NODE_ENV = 'production' && !hasManifest(kernel.nomenOut))
      ) {
        await kernel.builder.build()
        createManifest(kernel.nomenOut)
      }
    },
    handler: async context => {
      const path = new URL(context.request.url).pathname
      const baseRouteHandler = kernel.router.find('all', path)
      if (!baseRouteHandler) {
        const htmlRawContent = kernel.options.routeNotFoundTemplate
        return new Response(htmlRawContent, {
          headers: {
            'content-type': 'text/html',
          },
          status: 404,
        })
      }

      context.activeRouteHandler = baseRouteHandler
      if (baseRouteHandler.meta.disableMiddleware)
        return context.activeRouteHandler.handler(
          context,
          baseRouteHandler.params
        )

      return compose(kernel.handlers)(context)
    },
  }
}

function hasManifest(basePath) {
  const hasFile = fs.existsSync(join(basePath, 'nomen.json'))
  return hasFile
}

function createManifest(basePath) {
  fs.writeFileSync(
    join(basePath, 'nomen.json'),
    JSON.stringify(
      {
        buildTime: Date.now(),
      },
      null,
      2
    ),
    'utf8'
  )
}
