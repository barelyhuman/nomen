import { join } from 'node:path'
import { defineModule } from './lib/module.js'

defineModule({
  name: 'nomen:root',
  async onLoad(ctx) {
    ctx.nomenOut = '.nomen'
    ctx.projectRoot = join(process.cwd())
  },
})
