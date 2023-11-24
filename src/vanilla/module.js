import { html } from '@hattip/response'
import esbuild from 'esbuild'
import { basename, dirname, join } from 'node:path'
import { defineModule } from '../lib/module.js'
import { esbuildClientNormalizer } from '../lib/plugins/client-normalizer.js'
import { stringify } from '../head/utils.js'

let clientMapByPath = new Map()

export function vanilla() {
  defineModule({
    name: 'nomen:builders:vanilla',
    dependsOn: ['nomen:builder'],
    async onLoad(ctx) {
      const routeOutputs = []

      const chunkOut = join(ctx.packageRoot, ctx.nomenOut, 'client-chunks')

      for (let entry of ctx.routerEntries) {
        clientMapByPath.set(entry.path, join(chunkOut, basename(entry.path)))
        routeOutputs.push(entry.path)
      }

      const userBuildConfig = ctx.client?.esbuildOptions || {}

      await esbuild.build({
        entryPoints: routeOutputs,
        bundle: true,
        platform: 'node',
        allowOverwrite: true,
        format: 'esm',
        outdir: chunkOut,
        ...userBuildConfig,
        plugins: [
          esbuildClientNormalizer({
            loader: 'jsx',
            jsx: 'preserve',
          }),
        ],
      })
    },
  })

  defineModule({
    name: 'nomen:handlers:vanilla',
    dependsOn: ['nomen:handlers:root'],
    async onLoad(moduleCtx) {
      const handler = async ctx => {
        const activeRouteHandler = ctx.activeRouteHandler

        const keys = []
        for (let k of clientMapByPath.keys()) keys.push(k)

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

        const moduleDef = activeRouteHandler.handler

        let serverData = {}
        if ('onServer' in moduleDef) {
          const onServerResult = await moduleDef.onServer(
            ctx,
            activeRouteHandler.params
          )
          Object.assign(serverData, onServerResult)
        }

        const headContext = moduleCtx.getHeadContext()

        const headHTML = stringify(headContext)

        const source = join(activeRouteHandler.meta.path)
        const out = clientMapByPath.get(source)
        const htmlBase = moduleCtx.options.template.entry
          .replace(moduleCtx.options.template.placeholders.head, headHTML)
          .replace(moduleCtx.options.template.placeholders.content, '')
          .replace(
            moduleCtx.options.template.placeholders.scripts,
            ` <script type="application/json" id="__nomen_meta">
                ${JSON.stringify(serverData, null, 2)}
              </script>
              <script type="module" async defer>
                import { render } from '/${join(
                  '.nomen',
                  basename(dirname(out)),
                  basename(out)
                )}'

                try {
                  const elem = document.getElementById('__nomen_meta')
                  const props = JSON.parse(elem.innerText)
                  render(props)
                } catch (err) {
                  // TODO: add a error overlay
                  console.error(err)
                }
              </script>`
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
