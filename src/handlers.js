import { json } from '@hattip/response'
import { defineModule } from './lib/module.js'
import { toKey } from './lib/router.js'

defineModule({
  name: 'nomen:handlers:root',
  dependsOn: ['nomen:root'],
  onLoad(ctx) {
    ctx.handlers = []
  },
})

defineModule({
  name: 'nomen:handlers:json',
  dependsOn: ['nomen:handlers:root'],
  async onLoad(moduleContext) {
    const handler = async ctx => {
      const activeRouteHandler = ctx.activeRouteHandler

      const method = ctx.request.method

      let response

      const key = toKey(method)

      if (key in activeRouteHandler.handler) {
        response = await activeRouteHandler.handler[key](
          ctx,
          activeRouteHandler.params
        )
      } else if ('all' in activeRouteHandler.handler) {
        response = await activeRouteHandler.handler.all(
          ctx,
          activeRouteHandler.params
        )
      } else {
        response = await ctx.next()
      }

      if (response instanceof Response) {
        return response
      }

      if (typeof response == 'object') {
        return json(response)
      }

      return new Response('', {
        status: 404,
      })
    }

    moduleContext.handlers.push(handler)
  },
})
