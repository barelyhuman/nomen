import { dirname, isAbsolute, join } from 'node:path'
import { defineModule } from './lib/module.js'
import { findUp } from 'find-up'

defineModule({
  name: 'nomen:root',
  async onLoad(ctx) {
    if (ctx.options?.root) {
      const root = isAbsolute(ctx.options.root)
        ? ctx.options.root
        : join(process.cwd(), ctx.options.root)
      ctx.projectRoot = root
    } else {
      ctx.projectRoot = process.cwd()
    }

    ctx.nomenOut = join(process.cwd(), '.nomen')

    const pkgPath = await findUp('package.json', {
      cwd: ctx.projectRoot,
    })

    ctx.packageRoot = dirname(pkgPath)
  },
})
