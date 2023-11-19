import { createNomen } from 'nomen-js'
import { arrowJS } from 'nomen-js/arrow'
import { preact } from 'nomen-js/preact'
import routes from './routes.js'
import { createServer } from '@hattip/adapter-node'
import { vanilla } from 'nomen-js/vanilla'
import fs from 'node:fs'

const nomen = createNomen({
  routes: routes,
  modules: [vanilla, preact, arrowJS],
  template: {
    entry: fs.readFileSync('./index.html', 'utf8'),
  },
})

// const nomen = createNomen({
//   routes: routes,
//   modules: [arrowJS, preact, vanilla],
// //   template: {
// //     // entry: fs.readFileSync('./index.html', 'utf8'),
// //     // placeholders: {
// //     //   head: '<!-- app-head-placeholder -->',
// //     //   content: '<!-- app-content-placeholder -->',
// //     //   scripts: '<!-- app-scripts-placeholder -->',
// //     // },
// //   },
//   client: {
//     esbuildOptions: {
//       jsx: 'automatic',
//       jsxImportSource: 'preact',
//       loader: {
//         '.js': 'jsx',
//       },
//     },
//   },
// })

await nomen.boot()

createServer(nomen.handler)
  .listen(3000, () => {
    console.log(`Listening on http://localhost:3000`)
  })
  .on('error', err => {
    console.error(err)
  })
