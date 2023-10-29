import { loadModules } from '@nomen/module';
import './src/kernel.js';
import './src/builder.js';
import './src/handlers.js';

import defineRoutes from './src/builder.js';
import { compose } from '@hattip/compose';

export { defineModule, loadModules } from '@nomen/module';
export { enableArrowJS } from './src/lib/arrow-js.js';

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
