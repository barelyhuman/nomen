import astring from '@barelyhuman/astring-jsx'
import esbuildIslandPlugins from '@barelyhuman/preact-island-plugins/esbuild'
import { html } from '@hattip/response'
import * as acorn from 'acorn'
import jsx from 'acorn-jsx'
import esbuild from 'esbuild'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { h } from 'preact'
import renderToString from 'preact-render-to-string'
import { defineModule } from '../lib/module.js'

const { generate } = astring

let clientMapByPath = new Map()

const parser = acorn.Parser.extend(jsx())

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
          esbuildPreactClientRender(),
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

        const ProxyComponent = compiledModule.render
        const componentHTML = renderToString(
          h(ProxyComponent, {
            ...serverData.props,
          })
        )

        return html(
          `
            <div id="app">
              ${componentHTML}
            </div>
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

        const content = await esbuild.transform(generate(ast), {
          loader: 'jsx',
          jsx: 'preserve',
          treeShaking: true,
          platform: 'browser',
          format: 'esm',
        })

        return {
          contents: content.code,
          loader: 'jsx',
        }
      })
    },
  }
}
