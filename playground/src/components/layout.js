import { html } from '@arrow-js/core'

export function Layout(head, child) {
  return html`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${head}
      </head>
      <body>
        <div id="app">${child}</div>
      </body>
    </html>
  `
}
