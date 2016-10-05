import { loadModules } from '@nomen/module';
import './src/kernel.js';
import './src/builder.js';
import './src/handlers.js';

import defineRoutes from './src/builder.js';
import { compose } from '@hattip/compose';

export { defineModule, loadModules } from '@nomen/module';

export function createNomen({ routes }) {
  const kernel = {};
  defineRoutes(routes);
  return {
    boot: async () => {
      await loadModules(kernel);
    },
    handler: (context) => {
      const method = context.request.method;
      const path = new URL(context.request.url).pathname;
      const h = kernel.router.find(method, path);
      return compose(
        kernel.handlers.concat((ctx) => {
          return h.handler(ctx, h.params);
        })
      )(context);
    },
  };
}
