import astring from '@barelyhuman/astring-jsx'
import * as acorn from 'acorn'
import jsx from 'acorn-jsx'
import esbuild from 'esbuild'
import { readFile } from 'node:fs/promises'

const { generate } = astring
const parser = acorn.Parser.extend(jsx())

export function esbuildClientNormalizer(transformOptions, modifier) {
  return {
    name: 'nomen:esbuild:client',
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

        let modAST = ast
        if (modifier && typeof modifier === 'function') {
          modAST = modifier(modAST)
        }

        const content = await esbuild.transform(generate(modAST), {
          ...transformOptions,
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

function defaultModifier(x, _parser, _stringify) {
  return x
}
