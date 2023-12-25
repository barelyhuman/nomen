import { createServer } from '@hattip/adapter-node'
import { nomen } from './nomen.js'

const server = createServer(nomen.handler)
await nomen.boot(server)

server
  .listen(3000, () => {
    console.log(`Listening on http://localhost:3000`)
  })
  .on('error', err => {
    console.error(err)
  })
