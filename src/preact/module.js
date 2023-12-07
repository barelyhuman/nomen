import esbuildPlugin from '@barelyhuman/preact-island-plugins/esbuild'
import { html } from '@hattip/response'
import esbuild from 'esbuild'
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

      const chunkOut = join(ctx.packageRoot, ctx.nomenOut, 'server-chunks')

      for (let entry of ctx.routerEntries) {
        const sourceCode = entry.transformedSource
        const preactImportRegex =
          /(import)\s.*\s(from)\s(["'](preact\/jsx-runtime|preact\/jsx-dev-runtime)["'])/

        if (preactImportRegex.test(sourceCode)) {
          clientMapByPath.set(entry.path, join(chunkOut, basename(entry.path)))
          routeOutputs.push(entry.path)
        }
      }

      const userBuildConfig = ctx.client?.esbuildOptions || {}

      ctx.builder.add('preact', {
        entryPoints: routeOutputs,
        bundle: true,
        platform: 'node',
        allowOverwrite: true,
        format: 'esm',
        outdir: chunkOut,
        external: ['preact'],
        jsx: 'automatic',
        jsxImportSource: 'preact',
        loader: {
          '.js': 'jsx',
        },
        ...userBuildConfig,
        plugins: [
          esbuildPlugin({
            root: ctx.packageRoot,
            baseURL: '/.nomen/client-chunks/',
            atomic: true,
            client: {
              replaceParentNode: false,
              output: join(ctx.packageRoot, '.nomen/client-chunks'),
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

        const compiledOut = join(
          moduleCtx.packageRoot,
          moduleCtx.nomenOut,
          'server-chunks',
          basename(activeRouteHandler.meta.path)
        )

        const compiledModule = await import(compiledOut)
        const moduleDef = compiledModule

        let serverData = {}
        if ('onServer' in moduleDef) {
          const onServerResult = await moduleDef.onServer(
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
              <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
