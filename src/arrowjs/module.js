import { html } from '@hattip/response'
import { renderToString } from 'arrow-render-to-string'
import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineModule } from '../lib/module.js'
import { esbuildClientNormalizer } from '../lib/plugins/client-normalizer.js'

let clientMapByPath = new Map()

const __dirname = dirname(fileURLToPath(import.meta.url))

export function arrowJS() {
  defineModule({
    name: 'nomen:builders:arrowjs',
    dependsOn: ['nomen:builder'],
    async onLoad(ctx) {
      const routeOutputs = []

      const chunkOut = join(ctx.packageRoot, ctx.nomenOut, 'client-chunks')

      for (let entry of ctx.routerEntries) {
        const sourceCode = entry.transformedSource
        if (sourceCode.includes('@arrow-js/core')) {
          clientMapByPath.set(entry.path, join(chunkOut, basename(entry.path)))
          routeOutputs.push(entry.path)
        }
      }

      const userBuildConfig = ctx.client?.esbuildOptions || {}
      ctx.builder.add('arrow', {
        entryPoints: routeOutputs,
        bundle: true,
        platform: 'node',
        format: 'esm',
        outdir: chunkOut,
        ...userBuildConfig,
        plugins: [esbuildClientNormalizer()],
      })
    },
  })

  defineModule({
    name: 'nomen:handlers:arrowjs',
    dependsOn: ['nomen:handlers:root'],
    async onLoad(moduleCtx) {
      const handler = async ctx => {
        const activeRouteHandler = ctx.activeRouteHandler

        if (!clientMapByPath.has(activeRouteHandler.meta.path))
          return await ctx.next()

        if (activeRouteHandler.params[0] === 'favicon')
          return new Response(null, {
            status: 404,
          })

        if (!('render' in activeRouteHandler.handler))
          return new Response(null, {
            status: 404,
          })

        if ('onServer' in activeRouteHandler.handler)
          await activeRouteHandler.handler.onServer(
            ctx,
            activeRouteHandler.params
          )

        const output = await activeRouteHandler.handler.render()

        if (!('isT' in output)) return await ctx.next()

        const component = renderToString(output)
        const currentState = activeRouteHandler.handler.state
        const out = clientMapByPath.get(activeRouteHandler.meta.path)

        const headContext = moduleCtx.getHeadContext()

        return html(
          `
            <html>
            <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            ${headContext.title ? `<title>${headContext.title}</title>` : ''}
            </head>
            <body>
            <div id="app">${component}</div>
            <script type="application/json" id="__nomen_meta">
              ${JSON.stringify(currentState, null, 2)}
            </script>

            <script type="module" defer async>
              import { state, render } from '/${join(
                '.nomen',
                basename(dirname(out)),
                basename(out)
              )}'

              ${readFileSync(join(__dirname, 'rehydrate.js'), 'utf8')}

              rehydrate(state, render)
            </script>
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
