import { createNomen } from 'nomen-js'
import { arrowJS } from 'nomen-js/arrow'
import { preact } from 'nomen-js/preact'
import routes from './routes.js'
import { createServer } from '@hattip/adapter-node'

const nomen = createNomen({
  routes: routes,
  modules: [arrowJS, preact],
  esbuildConfig: {
    external: ['preact'],
    loader: {
      '.js': 'jsx',
    },
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
})

await nomen.boot()

createServer(nomen.handler).listen(3000, () => {
  console.log(`Listening on http://localhost: 3000`)
})
