import { html } from '@hattip/response';
import { defineModule } from '../lib/module.js';
import * as acorn from 'acorn';
import jsx from 'acorn-jsx';
import renderToString from 'preact-render-to-string';
import astring from '@barelyhuman/astring-jsx';
import esbuild from 'esbuild';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { h } from 'preact';

const { generate } = astring;

let clientMapByPath = new Map();

const parser = acorn.Parser.extend(jsx());

const __dirname = dirname(fileURLToPath(import.meta.url));

export function preact() {
  defineModule({
    name: 'nomen:builders:preact',
    dependsOn: ['nomen:builder'],
    async onLoad(ctx) {
      const routeOutputs = [];

      const chunkOut = join(ctx.projectRoot, ctx.nomenOut, 'client-chunks');

      for (let entry of ctx.routerEntries) {
        const fileData = readFileSync(entry.source, 'utf8');
        if (fileData.includes('preact')) {
          clientMapByPath.set(
            entry.source,
            join(chunkOut, basename(entry.source))
          );
          routeOutputs.push(entry.source);
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
      });
    },
  });

  defineModule({
    name: 'nomen:handlers:preact',
    dependsOn: ['nomen:handlers:root'],
    async onLoad(moduleCtx) {
      const handler = async (ctx) => {
        const activeRouteHandler = ctx.activeRouteHandler;

        if (
          !clientMapByPath.has(
            join(moduleCtx.projectRoot, activeRouteHandler.meta.path)
          )
        ) {
          return await ctx.next();
        }

        if (activeRouteHandler.params[0] === 'favicon') {
          return new Response(null, {
            status: 404,
          });
        }

        if (!('render' in activeRouteHandler.handler)) {
          return new Response(null, {
            status: 404,
          });
        }

        if ('onServer' in activeRouteHandler.handler) {
          await activeRouteHandler.handler.onServer(
            ctx,
            activeRouteHandler.params
          );
        }

        const ProxyComponent = activeRouteHandler.handler.render;
        const componentHTML = renderToString(h(ProxyComponent));

        const source = join(
          moduleCtx.projectRoot,
          activeRouteHandler.meta.path
        );

        const out = clientMapByPath.get(source);

        return html(
          `
            <div id="app">
              ${componentHTML}
            </div>
            <script type="module" defer>
              ${readFileSync(out, 'utf8')}
            </script>
          `,
          {
            headers: {
              'content-type': 'text/html',
            },
          }
        );
      };

      moduleCtx.handlers.push(handler);
    },
  });
}

function esbuildPreactClientRender() {
  return {
    name: 'nomen:preact:esbuild:client',
    setup(build) {
      build.onResolve({ filter: /\.js$/ }, async () => {
        // Nothing has side-effects, since it's for DCE anyway
        return {
          sideEffects: false,
        };
      });
      build.onLoad({ filter: /\.js$/ }, async (args) => {
        const source = await readFile(args.path, 'utf8');

        const ast = parser.parse(source, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        });

        let onServerOn;

        for (let nodeIndex in ast.body) {
          const node = ast.body[nodeIndex];
          if (node.type == 'ExportNamedDeclaration' && node.declaration) {
            if (
              node.declaration.type == 'FunctionDeclaration' &&
              node.declaration.id.type == 'Identifier' &&
              node.declaration.id.name == 'onServer'
            ) {
              onServerOn = nodeIndex;
            } else if (node.declaration.type == 'VariableDeclaration') {
              for (let decl of node.declaration.declarations) {
                if (decl.id && decl.id.type === 'Identifier') {
                  if (decl.id.name == 'onServer') {
                    onServerOn = nodeIndex;
                  }
                }
              }
            }
          }
        }

        ast.body = ast.body.filter((x, i) => i != onServerOn);

        const content = await esbuild.transform(generate(ast), {
          loader: 'jsx',
          jsx: 'preserve',
          treeShaking: true,
          platform: 'browser',
          format: 'esm',
        });

        content.code += `
          import {h,hydrate} from "preact"
          const appContainer = document.getElementById("app")
          hydrate(h(render,{}),appContainer)
        `;

        return {
          contents: content.code,
          loader: 'jsx',
        };
      });
    },
  };
}
