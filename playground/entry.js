import { createNomen } from 'nomen-js'
import { arrowJS } from 'nomen-js/arrow'
import { preact } from 'nomen-js/preact'
import routes from './routes.js'
import { createServer } from '@hattip/adapter-node'
import { vanilla } from 'nomen-js/vanilla'

const nomen = createNomen({
  routes: routes,
  modules: [arrowJS, preact, vanilla],
  client: {
    esbuildOptions: {
      jsx: 'automatic',
      jsxImportSource: 'preact',
      loader: {
        '.js': 'jsx',
      },
    },
  },
})

await nomen.boot()

createServer(nomen.handler).listen(3000, () => {
  console.log(`Listening on http://localhost:3000`)
})
