import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultEntry = join(__dirname, '../runtime/templates/index.html')

const html = String.raw

export const defaultConfig = {
  root: process.cwd(),
  routes: {},
  modules: [],
  template: {
    entry: fs.existsSync(defaultEntry) && fs.readFileSync(defaultEntry, 'utf8'),
    placeholders: {
      head: '<!-- app-head-placeholder -->',
      content: '<!-- app-content-placeholder -->',
      scripts: '<!-- app-scripts-placeholder -->',
    },
  },
  assets: [
    {
      baseURL: 'assets',
      dir: 'assets',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  ],
  routeNotFoundTemplate: html`
    <html>
      <head>
        <title>Not Found</title>
      </head>
      <body>
        <h1>404</h1>
        <p>Not Found at all</p>
      </body>
    </html>
  `,
  client: {
    esbuildOptions: {
      jsx: 'automatic',
      jsxImportSource: 'preact',
      loader: {
        '.js': 'jsx',
      },
    },
  },
}
