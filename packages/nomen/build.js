import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

await esbuild.build({
  entryPoints: ['src/index.js'],
  outfile: './dist/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  logLevel: 'info',
  target: 'node14',
  plugins: [
    nodeExternalsPlugin({
      allowList: ['@nomen/module', '@nomen/router'],
    }),
  ],
});
