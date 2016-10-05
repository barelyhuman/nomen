import esbuild from 'esbuild';
import { dirname, join } from 'node:path';
import { defineModule } from '@nomen/module';

let _routeConfig = {};

export default async function defineRoutes(routeConfig) {
  _routeConfig = routeConfig;
}

const allHTTPMethods = ['get', 'post', 'put', 'update', 'delete'];

defineModule({
  name: 'nomen:builder',
  dependsOn: ['nomen:root'],
  async onLoad(ctx) {
    const router = createRouter();
    ctx.router = router;

    const chunkOut = join(ctx.projectRoot, 'dist/route-chunks');

    const allEntries = Object.keys(_routeConfig).map((key) => ({
      source: join(ctx.projectRoot, _routeConfig[key]),
      dist: _routeConfig[key].replace(dirname(_routeConfig[key]), chunkOut),
    }));

    await esbuild.build({
      entryPoints: allEntries.map((x) => x.source),
      bundle: true,
      external: ['@arrow-js/core'],
      platform: 'node',
      format: 'esm',
      splitting: true,
      outdir: chunkOut,
      plugins: ctx.esbuildPlugins || [],
    });

    for (let key of Object.keys(_routeConfig)) {
      const splits = key.split(' ');
      let methods = [];
      let urlPath = key;

      if (splits.length === 2) {
        methods.push(splits[0]);
        urlPath = splits[1];
      } else {
        methods.push(...allHTTPMethods);
      }

      const _path = _routeConfig[key].replace(
        dirname(_routeConfig[key]),
        chunkOut
      );

      const handler = await import(_path);

      methods.forEach((method) => {
        router.add(method, urlPath, handler.default);
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
    meta,
  });

  handlers.sort((x, y) => {
    if (x.isDynamic && x.hasWildCard) {
      return 1;
    } else if (x.isDynamic && !x.hasWildCard) {
      return -1;
    } else {
      return -1;
    }
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

function toKey(d) {
  return d.trim().toLowerCase();
}
