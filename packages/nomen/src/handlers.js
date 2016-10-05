import { html, json } from '@hattip/response';
import { renderToString } from 'arrow-render-to-string';
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
  async onLoad(ctx) {
    const handler = async (ctx) => {
      const response = await ctx.next();
      if (response instanceof Response) {
        return response;
      }
      if (typeof response == 'object' && !('isT' in response)) {
        return json(response);
      }
    };
    ctx.handlers.push(handler);
  },
});

defineModule({
  name: 'nomen:handlers:arrowjs',
  dependsOn: ['nomen:handlers:root'],
  async onLoad(ctx) {
    const handler = async (ctx) => {
      const response = await ctx.next();
      if (response instanceof Response) {
        return response;
      }
      if ('isT' in response) {
        return html(renderToString(response), {
          headers: {
            'content-type': 'text/html',
          },
        });
      }
    };
    ctx.handlers.push(handler);
  },
});
