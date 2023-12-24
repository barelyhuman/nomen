import { createNomen } from 'nomen-js'
import { arrowJS } from 'nomen-js/arrow'
import { preact } from 'nomen-js/preact'
import routes from './routes.js'
import { createServer } from '@hattip/adapter-node'
import { vanilla } from 'nomen-js/vanilla'
import fs from 'node:fs'

const nomen = createNomen({
  routes: {
    ...routes,
    '/name/sid': () => import('./routes/sid.js'),
  },
  modules: [preact, arrowJS, vanilla],
  template: {
    entry: fs.readFileSync('./index.html', 'utf8'),
  },
})

const server = createServer(nomen.handler)
await nomen.boot(server)

server
  .listen(3000, () => {
    console.log(`Listening on http://localhost:3000`)
  })
  .on('error', err => {
    console.error(err)
  })
