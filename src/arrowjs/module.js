import { html } from '@hattip/response'
import { renderToString } from 'arrow-render-to-string'
import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineModule } from '../lib/module.js'
import { esbuildClientNormalizer } from '../lib/plugins/client-normalizer.js'
import { stringify } from '../head/utils.js'

let clientMapByPath = new Map()

const __dirname = dirname(fileURLToPath(import.meta.url))

export function arrowJS() {
  defineModule({
    name: 'nomen:builders:arrowjs',
    dependsOn: ['nomen:builder'],
    async onLoad(ctx) {
      const routeOutputs = []

      const chunkOut = join(ctx.nomenOut, 'client-chunks')

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

        const moduleDef = await activeRouteHandler.meta.reimportModule()

        let serverOutput = {}
        if ('onServer' in moduleDef) {
          const onServerResult = await moduleDef.onServer(
            ctx,
            activeRouteHandler.params
          )
          if (onServerResult instanceof Response) 
            return onServerResult
          
          Object.assign(serverOutput, onServerResult)
        }

        if (!('render' in activeRouteHandler.handler)) return serverOutput

        const output = await moduleDef.render(serverOutput)

        if (!('isT' in output)) return await ctx.next()

        const component = renderToString(output)
        const out = clientMapByPath.get(activeRouteHandler.meta.path)

        const headContext = moduleCtx.getHeadContext()
        const headHTML = stringify(headContext)

        const htmlBase = moduleCtx.options.template.entry
          .replace(moduleCtx.options.template.placeholders.head, headHTML)
          .replace(moduleCtx.options.template.placeholders.content, component)
          .replace(
            moduleCtx.options.template.placeholders.scripts,
            `
            <script type="application/json" id="__nomen_meta">
              ${JSON.stringify(serverOutput, null, 2)}
            </script>
          
            ${moduleCtx.socket.getConnectionScript()}
              
              <script type="module" defer async>
              import { render } from '/${join(
                '.nomen',
                basename(dirname(out)),
                basename(out)
              )}'

              ${readFileSync(join(__dirname, 'rehydrate.js'), 'utf8')}

              rehydrate(render)
            </script>
            `
          )

        return html(htmlBase, {
          headers: {
            'content-type': 'text/html',
          },
        })
      }

      moduleCtx.handlers.push(handler)
    },
  })
}
