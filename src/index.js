import './builder.js'
import './handlers.js'
import './head/module.js'
import './kernel.js'
import { defineModule, loadModules } from './lib/module.js'

import fs from 'node:fs'

import { compose } from '@hattip/compose'

export { defineModule }

import { join } from 'node:path'
import defineRoutes from './builder.js'
import { defu } from 'defu'

const defaultEntry = join(process.cwd(), 'src', './index.html')

const defaultConfig = {
  routes: {},
  modules: [],
  template: {
    entry: fs.existsSync(defaultEntry) && fs.readFileSync(defaultEntry, 'utf8'),
    placeholders: {
      head: '<!-- app-head-placeholder -->',
      content: '<!-- app-content-placeholder -->',
      scripts: '<!-- app-scripts-placeholder -->',
    },
  },
  client: {
    esbuildOptions: {
      jsx: 'automatic',
      jsxImportSource: 'preact',
      loader: {
        '.js': 'jsx',
      },
    },
  },
}

export function createNomen(options = {}) {
  const mergedConfig = defu(options, defaultConfig)
  const { routes, modules, client = {} } = mergedConfig

  const kernel = {
    options: mergedConfig,
    client: client,
  }

  defineRoutes(routes)

  return {
    boot: async () => {
      modules.forEach(mod => {
        mod()
      })
      await loadModules(kernel)
    },
    handler: context => {
      const path = new URL(context.request.url).pathname
      const baseRouteHandler = kernel.router.find('all', path)
      if (!baseRouteHandler)
        return new Response('Not Found', {
          status: 404,
        })

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
