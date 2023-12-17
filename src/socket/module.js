import { defineModule } from '../lib/module.js'
import { WebSocketServer, OPEN } from 'ws'

function connectionHandler() {
  return client => {
    client.on('message', data => {
      const msg = JSON.parse(data)
      console.log({ msgd: msg })
    })
  }
}
defineModule({
  name: 'nomen:socket',
  dependsOn: ['nomen:builder', 'nomen:watcher'],
  onLoad(ctx) {
    ctx.socket = {}
    const socketServer = new WebSocketServer({
      noServer: true,
    })

    ctx.socket = socketServer
    ctx.server.on('connection', connectionHandler())
    ctx.server.on('upgrade', (req, socket, head) => {
      socketServer.handleUpgrade(req, socket, head, client => {
        client.emit('connection', client, req)
        connectionHandler()(client)
      })
    })
  },
  onBooted(ctx) {
    ctx.server.on('connection', client => {
      // Get server's current running port
      ctx.socket.runningOnPort = ctx.server.address().port
    })

    ctx.socket.broadcast = data => {
      ctx.socket.clients.forEach(c => {
        if (c.readyState !== OPEN) return
        c.send(JSON.stringify(data))
      })
    }

    setTimeout(() => {
      ctx.socket.clients.forEach(c =>
        c.send(JSON.stringify({ type: 'reload' }))
      )
    }, 3000)

    ctx.socket.getConnectionScript = ''
    if (ctx.env.NOMEN_DEV)
      ctx.socket.getConnectionScript = () => `<script>
        const serverAddress = window.location.hostname;
        const socket = new WebSocket(
          \`ws://\${serverAddress}:${ctx.socket.runningOnPort}\`
        )

        socket.addEventListener("message", (event) => {
            const msg = JSON.parse(event.data)
            switch(msg.type){
                case "invalidate":
                case "reload":{
                    window.location.reload()
                }
            }
          });

      </script>`
  },
})
