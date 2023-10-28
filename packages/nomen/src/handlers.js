import { json } from '@hattip/response';
import { defineModule } from '@nomen/module';

defineModule({
  name: 'nomen:handlers:root',
  dependsOn: ['nomen:root'],
  onLoad(ctx) {
    ctx.handlers = [];
  },
});

defineModule({
  name: 'nomen:handlers:json',
  dependsOn: ['nomen:handlers:root'],
  async onLoad(moduleContext) {
    const handler = async (ctx) => {
      const activeRouteHandler = ctx.activeRouteHandler;

      const method = ctx.request.method;

      let response;

      if (method in activeRouteHandler.handler) {
        response = activeRouteHandler.handler[method](
          ctx,
          activeRouteHandler.params
        );
      } else if ('all' in activeRouteHandler.handler) {
        response = activeRouteHandler.handler.all(
          ctx,
          activeRouteHandler.params
        );
      } else {
        response = await ctx.next();
      }

      if (response instanceof Response) {
        return response;
      }

      if (typeof response == 'object') {
        return json(response);
      }
    };

    moduleContext.handlers.push(handler);
  },
});
