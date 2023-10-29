import { defineModule, loadModules } from './lib/module.js';
import './builder.js';
import './handlers.js';
import './kernel.js';

import { compose } from '@hattip/compose';

export { defineModule };

import defineRoutes from './builder.js';

export function createNomen({ routes, modules, esbuildPlugins }) {
  const kernel = {
    esbuildPlugins: esbuildPlugins,
  };

  defineRoutes(routes);

  return {
    boot: async () => {
      modules.forEach((mod) => {
        mod();
      });
      await loadModules(kernel);
    },
    handler: (context) => {
      const path = new URL(context.request.url).pathname;
      const h = kernel.router.find('all', path);
      context.activeRouteHandler = h;
      return compose(kernel.handlers)(context);
    },
  };
}
