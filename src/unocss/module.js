import { html } from '@hattip/response'
import { defineModule } from 'nomen-js'
import { createGenerator } from 'unocss'

export function unocss(config) {
  return () => {
    defineModule({
      name: 'nomen:css:unocss',
      dependsOn: ['nomen:builder', 'nomen:handlers:root'],
      async onLoad(moduleCtx) {
        const handler = async ctx => {
          const result = await ctx.next()
          const contentType = result.headers.get('content-type')
          if (contentType === 'text/html') {
            const generator = createGenerator(config)
            const oldHTML = await result.text()
            const cssOutput = await generator.generate(oldHTML)
            if (/\<(head)\>/.test(oldHTML)) {
              const htmlResult = oldHTML.replace(
                `<head></head>`,
                `<head>
                  <style>
                    ${cssOutput.css}
                  </style>
                </head>`
              )
              return html(htmlResult)
            } else {
              return html(`
                <style>
                  ${cssOutput.css}
                </style>
                ${oldHTML}
              `)
            }
          }
          return result
        }
        moduleCtx.handlers.unshift(handler)
      },
    })
  }
}
