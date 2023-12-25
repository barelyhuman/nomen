import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createNomen } from 'nomen-js'
import { arrowJS } from 'nomen-js/arrow'
import { preact } from 'nomen-js/preact'
import { vanilla } from 'nomen-js/vanilla'
import routes from './routes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const nomen = createNomen({
  root: __dirname,
  routes: {
    ...routes,
    '/name/sid': () => import('./routes/sid.js'),
  },
  modules: [preact, arrowJS, vanilla],
  template: {
    entry: fs.readFileSync(join(__dirname, './index.html'), 'utf8'),
  },
})
