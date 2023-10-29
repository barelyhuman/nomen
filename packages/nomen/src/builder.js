import esbuild from 'esbuild';
import { dirname, join } from 'node:path';
import { defineModule } from '@nomen/module';
import { toKey } from './lib/router.js';

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

    await esbuild.build({
      entryPoints: allEntries.map((x) => x.source),
      bundle: true,
      platform: 'node',
      format: 'esm',
      splitting: true,
      outdir: chunkOut,
      plugins: ctx.esbuildPlugins || [],
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

function createRouter() {
  const routes = new Map();
  return {
    add: (method, route, handler, meta) =>
      add(routes, method, route, handler, meta),
    find: (method, route) => find(routes, method, route),
  };
}

function add(routerMap, method, route, handler, meta) {
  const key = toKey(method);
  const handlers = routerMap.get(key) || [];
  let isDynamic = false;
  let hasWildCard = false;
  let isRootRoute = false;

  if (route == '/') {
    isRootRoute = true;
  }

  if (/\*/.test(route)) {
    isDynamic = true;

    if (/\*{2}/.test(route)) {
      hasWildCard = true;
    }
  }

  const _regex = route
    .replace(/[/](\*{2})/g, '[/]*(.*)')
    .replace(/[/]\*{1}/g, '[/](\\w+)');

  handlers.push({
    route,
    routeRegex: new RegExp(_regex),
    hasWildCard,
    handler,
    isDynamic,
    isRootRoute,
    meta,
  });

  handlers.sort((x, y) => {
    if (x.isRootRoute) {
      return 2;
    }
    if (x.hasWildCard && x.isDynamic && y.hasWildCard && y.isDynamic) {
      return 0;
    } else if (!x.hasWildCard && x.isDynamic && !y.hasWildCard && y.isDynamic) {
      return 0;
    } else if (x.isDyanmic && !y.isDynamic) {
      return 1;
    } else if (x.hasWildCard && !y.hasWildCard) {
      return 1;
    }
    return -1;
  });

  routerMap.set(key, handlers);
}

function find(routerMap, method, urlPath) {
  let params = [];
  const handlerInfo = (routerMap.get(toKey(method)) || []).find((x) => {
    if (x.route == urlPath) {
      return true;
    }

    const isDynamic = x.routeRegex.test(urlPath);

    if (!isDynamic) {
      return false;
    }

    params = urlPath.match(x.routeRegex).slice(1);

    return true;
  });

  let result = null;

  if (handlerInfo) {
    result = Object.assign({}, handlerInfo, {
      params: params ? params.map((x) => x.split('/')).flat(2) : [],
    });
  }

  return result;
}
