import esbuild from 'esbuild'
import { nodeExternals } from 'esbuild-plugin-node-externals'

await esbuild.build({
  entryPoints: ['./entry.js'],
  bundle: true,
  outdir: 'dist',
  splitting: true,
  jsx: 'automatic',
  external: ['preact'],
  jsxImportSource: 'preact',
  loader: {
    '.js': 'jsx',
  },
  treeShaking: true,
  format: 'esm',
  target: 'node16',
  platform: 'node',
  plugins: [nodeExternals()],
})
