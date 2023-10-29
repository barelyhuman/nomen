import { loadModules } from '@nomen/module';
import './kernel.js';
import './builder.js';
import './handlers.js';

import defineRoutes from './builder.js';
import { compose } from '@hattip/compose';

export { defineModule, loadModules } from '@nomen/module';
export { enableArrowJS } from './lib/arrow-js.js';

export function createNomen({ routes, esbuildPlugins }) {
  const kernel = {
    esbuildPlugins: esbuildPlugins,
  };

  defineRoutes(routes);

  return {
    boot: async () => {
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
