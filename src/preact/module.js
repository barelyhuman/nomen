import { html } from '@hattip/response'
import { defineModule } from '../lib/module.js'
import * as acorn from 'acorn'
import jsx from 'acorn-jsx'
import renderToString from 'preact-render-to-string'
import astring from '@barelyhuman/astring-jsx'
import esbuild from 'esbuild'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { h } from 'preact'
import { addImportToAST } from '../lib/ast.js'

const { generate } = astring

let clientMapByPath = new Map()

const parser = acorn.Parser.extend(jsx())

const __dirname = dirname(fileURLToPath(import.meta.url))

export function preact() {
  defineModule({
    name: 'nomen:builders:preact',
    dependsOn: ['nomen:builder'],
    async onLoad(ctx) {
      const routeOutputs = []

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
        jsx: 'automatic',
        jsxImportSource: 'preact',
        loader: {
          '.js': 'jsx',
        },
        format: 'esm',
        outdir: chunkOut,
        plugins: [esbuildPreactClientRender()],
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

        let serverData = {}
        if ('onServer' in activeRouteHandler.handler) {
          const onServerResult = await activeRouteHandler.handler.onServer(
            ctx,
            activeRouteHandler.params
          )
          Object.assign(serverData, onServerResult)
        }

        const ProxyComponent = activeRouteHandler.handler.render
        const componentHTML = renderToString(
          h(ProxyComponent, {
            ...serverData.props,
          })
        )

        const source = join(moduleCtx.projectRoot, activeRouteHandler.meta.path)

        const out = clientMapByPath.get(source)

        return html(
          `
            <div id="app">
              ${componentHTML}
            </div>
            <script type="text/json" id="_meta">
              ${JSON.stringify(serverData.props, null, 2)}
            </script>
            <script type="module" defer>
              ${readFileSync(out, 'utf8')}
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

function esbuildPreactClientRender() {
  return {
    name: 'nomen:preact:esbuild:client',
    setup(build) {
      build.onResolve({ filter: /\.js$/ }, async () => {
        // Nothing has side-effects, since it's for DCE anyway
        return {
          sideEffects: false,
        }
      })
      build.onLoad({ filter: /\.js$/ }, async args => {
        const source = await readFile(args.path, 'utf8')

        const ast = parser.parse(source, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        })

        let onServerOn

        for (let nodeIndex in ast.body) {
          const node = ast.body[nodeIndex]
          if (node.type == 'ExportNamedDeclaration' && node.declaration) {
            if (
              node.declaration.type == 'FunctionDeclaration' &&
              node.declaration.id.type == 'Identifier' &&
              node.declaration.id.name == 'onServer'
            ) {
              onServerOn = nodeIndex
            } else if (node.declaration.type == 'VariableDeclaration') {
              for (let decl of node.declaration.declarations) {
                if (decl.id && decl.id.type === 'Identifier') {
                  if (decl.id.name == 'onServer') {
                    onServerOn = nodeIndex
                  }
                }
              }
            }
          }
        }

        ast.body = ast.body.filter((x, i) => i != onServerOn)

        const addImport = addImportToAST(ast)
        addImport('h', 'preact', { named: true })
        addImport('hydrate', 'preact', { named: true })

        const content = await esbuild.transform(generate(ast), {
          loader: 'jsx',
          jsx: 'preserve',
          treeShaking: true,
          platform: 'browser',
          format: 'esm',
        })

        content.code += `
          const appContainer = document.getElementById("app")
          const meta = document.querySelector("script#_meta")
          const stateJson = JSON.parse(meta.innerText)
          hydrate(h(render,{
            ...stateJson
          }),appContainer)
        `

        return {
          contents: content.code,
          loader: 'jsx',
        }
      })
    },
  }
}
