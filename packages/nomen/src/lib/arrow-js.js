import { html } from '@hattip/response';
import { defineModule } from '@nomen/module';
import * as acorn from 'acorn';
import { renderToString } from 'arrow-render-to-string';
import { generate } from 'astring';
import esbuild from 'esbuild';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let clientMapByPath = new Map();

const __dirname = dirname(fileURLToPath(import.meta.url));

export function enableArrowJS() {
  defineModule({
    name: 'nomen:builders:arrowjs',
    dependsOn: ['nomen:builder'],
    async onLoad(ctx) {
      const routeOutputs = [];

      const chunkOut = join(ctx.projectRoot, ctx.nomenOut, 'client-chunks');

      for (let entry of ctx.routerEntries) {
        const fileData = readFileSync(entry.source, 'utf8');
        if (fileData.includes('@arrow-js/core')) {
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
        platform: 'browser',
        format: 'esm',
        outdir: chunkOut,
        plugins: [esbuildArrowClientRender()],
      });
    },
  });

  defineModule({
    name: 'nomen:handlers:arrowjs',
    dependsOn: ['nomen:handlers:root'],
    async onLoad(moduleCtx) {
      const handler = async (ctx) => {
        const activeRouteHandler = ctx.activeRouteHandler;

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
        const output = await activeRouteHandler.handler.render();
        const component = renderToString(output);
        const currentState = activeRouteHandler.handler.state;
        const source = join(
          moduleCtx.projectRoot,
          activeRouteHandler.meta.path
        );

        const out = clientMapByPath.get(source);

        return html(
          `
          ${component}
          <script type="application/json" id="_meta">
            ${JSON.stringify(currentState, null, 2)}
          </script>
          <script type="module">
              ${readFileSync(out, 'utf8')}
              ${readFileSync(join(__dirname, './rehydrate.js'), 'utf8')}
              
              rehyrdate(state)
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

export function esbuildArrowClientRender() {
  return {
    name: 'nomen:esbuild:client',
    setup(build) {
      build.onResolve({ filter: /\.js$/ }, async () => {
        // Nothing has side-effects, since it's for DCE anyway
        return {
          sideEffects: false,
        };
      });
      build.onLoad({ filter: /\.js$/ }, async (args) => {
        const source = await readFile(args.path, 'utf8');

        const ast = acorn.parse(source, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        });

        let onServerOn;

        for (let nodeIndex in ast.body) {
          const node = ast.body[nodeIndex];
          if (node.type == 'ExportNamedDeclaration') {
            if (
              node.declaration &&
              node.declaration.type == 'VariableDeclaration'
            ) {
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
          treeShaking: true,
          platform: 'browser',
        });

        return {
          contents: content.code,
        };
      });
    },
  };
}
