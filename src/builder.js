import esbuild from 'esbuild';
import { dirname, join } from 'node:path';
import { defineModule } from './lib/module.js';
import { createRouter } from './lib/router.js';

let _routeConfig = {};

export default async function defineRoutes(routeConfig) {
  _routeConfig = routeConfig;
}

defineModule({
  name: 'nomen:builder',
  dependsOn: ['nomen:root'],
  async onLoad(ctx) {
    const router = createRouter();
    ctx.router = router;

    const chunkOut = join(ctx.projectRoot, ctx.nomenOut, 'route-chunks');

    const allEntries = Object.keys(_routeConfig).map((key) => ({
      source: join(ctx.projectRoot, _routeConfig[key]),
      dist: _routeConfig[key].replace(dirname(_routeConfig[key]), chunkOut),
    }));

    ctx.routerEntries = allEntries;

    const esbuildConfig = ctx.esbuildConfig || {};
    const plugins = esbuildConfig.plugins || [];

    await esbuild.build({
      entryPoints: allEntries.map((x) => x.source),
      bundle: true,
      external: ['preact'],
      platform: 'node',
      format: 'esm',
      splitting: true,
      outdir: chunkOut,
      ...esbuildConfig,
      plugins,
    });

    for (let key of Object.keys(_routeConfig)) {
      let urlPath = key;
      const _path = _routeConfig[key].replace(
        dirname(_routeConfig[key]),
        chunkOut
      );
      const handler = await import(_path);
      router.add('all', urlPath, handler, {
        path: _routeConfig[key],
      });
    }
  },
});
