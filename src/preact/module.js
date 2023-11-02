import esbuildIslandPlugins from '@barelyhuman/preact-island-plugins/esbuild'
import { html } from '@hattip/response'
import esbuild from 'esbuild'
import { readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { h } from 'preact'
import renderToString from 'preact-render-to-string'
import { defineModule } from '../lib/module.js'
import { esbuildClientNormalizer } from '../lib/plugins/client-normalizer.js'

let clientMapByPath = new Map()

export function preact() {
  defineModule({
    name: 'nomen:builders:preact',
    dependsOn: ['nomen:builder'],
    async onLoad(ctx) {
      const routeOutputs = []

      const serverChunkOut = join(ctx.projectRoot, ctx.nomenOut, 'route-chunks')
      const chunkOut = join(ctx.projectRoot, ctx.nomenOut, 'client-chunks')

      for (let entry of ctx.routerEntries) {
        // In case of preact, the output will have the import since the
        // preact import might not be used while defining jsx components
        // and is controlled the `esbuildConfig` passed to nomen
        const outFileData = readFileSync(entry.dist, 'utf8')

        if (outFileData.includes('preact')) {
          clientMapByPath.set(
            entry.source,
            join(chunkOut, basename(entry.source))
          )
          routeOutputs.push(entry.source)
        }
      }

      await esbuild.build({
        entryPoints: routeOutputs,
        bundle: true,
        platform: 'node',
        allowOverwrite: true,
        jsx: 'automatic',
        jsxImportSource: 'preact',
        loader: {
          '.js': 'jsx',
        },
        external: ['preact'],
        format: 'esm',
        outdir: serverChunkOut,
        plugins: [
          esbuildIslandPlugins({
            root: ctx.projectRoot,
            baseURL: '/.nomen/client-chunks/',
            atomic: true,
            client: {
              output: join(ctx.projectRoot, '.nomen/client-chunks'),
            },
          }),
          esbuildClientNormalizer({
            loader: 'jsx',
            jsx: 'preserve',
          }),
        ],
      })
    },
  })

  defineModule({
    name: 'nomen:handlers:preact',
    dependsOn: ['nomen:handlers:root'],
    async onLoad(moduleCtx) {
      const handler = async ctx => {
        const activeRouteHandler = ctx.activeRouteHandler

        if (
          !clientMapByPath.has(
            join(moduleCtx.projectRoot, activeRouteHandler.meta.path)
          )
        ) {
          return await ctx.next()
        }

        if (activeRouteHandler.params[0] === 'favicon') {
          return new Response(null, {
            status: 404,
          })
        }

        if (!('render' in activeRouteHandler.handler)) {
          return new Response(null, {
            status: 404,
          })
        }

        const compiledModule = await import(
          `${activeRouteHandler.meta.outfile}?t=${Date.now()}`
        )

        let serverData = {}
        if ('onServer' in compiledModule) {
          const onServerResult = await compiledModule.onServer(
            ctx,
            activeRouteHandler.params
          )
          Object.assign(serverData, onServerResult)
        }

        const headContext = moduleCtx.getHeadContext()

        const ProxyComponent = compiledModule.render
        const componentHTML = renderToString(
          h(ProxyComponent, {
            ...serverData.props,
          })
        )

        return html(
          `
            <html>
              <head>
                ${
                  headContext.title ? `<title>${headContext.title}</title>` : ''
                }
              </head>
              <body>
                <div id="app">${componentHTML}</div>
              </body>
            </html>
          `,
          {
            headers: {
              'content-type': 'text/html',
            },
          }
        )
      }

      moduleCtx.handlers.push(handler)
    },
  })
}
