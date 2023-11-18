import { isAbsolute, join } from 'node:path'
import { defineModule } from './lib/module.js'

defineModule({
  name: 'nomen:root',
  async onLoad(ctx) {
    ctx.nomenOut = '.nomen'
    if (ctx.options?.root) {
      const root = isAbsolute(ctx.options.root)
        ? ctx.options.root
        : join(process.cwd(), ctx.options.root)
      ctx.projectRoot = root
    } else {
      ctx.projectRoot = process.cwd()
    }
  },
})
