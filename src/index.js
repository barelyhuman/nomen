import './builder.js'
import './handlers.js'
import './head/module.js'
import './kernel.js'
import './watcher.js'
import './socket/module.js'
import { defineModule, loadModules } from './lib/module.js'

import fs from 'node:fs'

import { compose } from '@hattip/compose'

export { defineModule }

import { join } from 'node:path'
import defineRoutes from './builder.js'
import { defu } from 'defu'

const defaultEntry = join(process.cwd(), 'src', './index.html')

const html = String.raw

const nomenAsset = {
  baseURL: '.nomen',
  dir: '.nomen',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

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
  assets: [
    {
      baseURL: 'assets',
      dir: 'assets',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  ],
  routeNotFoundTemplate: html`
    <html>
      <head>
        <title>Not Found</title>
      </head>
      <body>
        <h1>404</h1>
        <p>Not Found at all</p>
      </body>
    </html>
  `,
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
