import { html } from '@hattip/response'
import { renderToString } from 'arrow-render-to-string'
import esbuild from 'esbuild'
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

      const chunkOut = join(ctx.projectRoot, ctx.nomenOut, 'client-chunks')

      for (let entry of ctx.routerEntries) {
        const fileData = readFileSync(entry.source, 'utf8')
        if (fileData.includes('@arrow-js/core')) {
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
        format: 'esm',
        outdir: chunkOut,
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

        if ('onServer' in activeRouteHandler.handler) {
          await activeRouteHandler.handler.onServer(
            ctx,
            activeRouteHandler.params
          )
        }

        const output = await activeRouteHandler.handler.render()

        if (!('isT' in output)) {
          return await ctx.next()
        }

        const component = renderToString(output)
        const currentState = activeRouteHandler.handler.state
        const source = join(moduleCtx.projectRoot, activeRouteHandler.meta.path)

        const out = clientMapByPath.get(source)

        return html(
          `
          ${component}
          <script type="application/json" id="_meta">
            ${JSON.stringify(currentState, null, 2)}
          </script>
          
          <script type="module">
            import {state,render} from "/${join(
              '.nomen',
              basename(dirname(out)),
              basename(out)
            )}"

            ${readFileSync(join(__dirname, 'rehydrate.js'), 'utf8')}

            rehydrate(state,render)
            
          </script>
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
