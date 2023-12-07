import { createNomen } from 'nomen-js'
import { arrowJS } from 'nomen-js/arrow'
import { preact } from 'nomen-js/preact'
import { hmr } from 'nomen-js/hmr'
import routes from './routes.js'
import { createServer } from '@hattip/adapter-node'
import { vanilla } from 'nomen-js/vanilla'
import fs from 'node:fs'

const nomen = createNomen({
  routes: routes,
  modules: [hmr, preact, arrowJS, vanilla],
  template: {
    entry: fs.readFileSync('./index.html', 'utf8'),
  },
})

await nomen.boot()

createServer(nomen.handler)
  .listen(3000, () => {
    console.log(`Listening on http://localhost:3000`)
  })
  .on('error', err => {
    console.error(err)
  })
