import { createNomen } from 'nomen-js'
import { arrowJS } from 'nomen-js/arrow'
import routes from './routes.js'
import { createServer } from '@hattip/adapter-node'

const nomen = createNomen({
  routes: routes,
  modules: [arrowJS],
})

await nomen.boot()

createServer(nomen.handler).listen(3000, () => {
  console.log(`Listening on http://localhost: 3000`)
})
