import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'
import sucrase from 'sucrase'

global.nomenCache = {}

export async function load(uri, context, fallback) {
  if (uri.startsWith('node:')) return fallback(uri, context, fallback)

  const file = fileURLToPath(uri)
  const extn = extname(file)
  if (['.js', '.jsx', '.ts', '.tsx'].includes(extn)) {
    const code = await readFile(file, 'utf8')
    const output = sucrase.transform(code, {
      transforms: ['typescript', 'jsx'],
      jsxImportSource: 'preact',
      jsxRuntime: 'automatic',
    })

    global.nomenCache[file] = output.code

    return {
      format: context.format || 'commonjs',
      source: output.code,
      shortCircuit: true,
    }
  }

  return fallback(uri, context, fallback)
}

export function resolve(ident, context, fallback) {
  return fallback(ident, context, fallback)
}
