import chokidar from 'chokidar'
import { defineModule } from './lib/module.js'

defineModule({
  name: 'nomen:watcher',
  dependsOn: ['nomen:builder'],
  async onLoad(ctx) {
    if (!ctx.env.NOMEN_DEV) return

    const watcherInstance = chokidar.watch('.', {
      ignored: [/.nomen/, /node_modules/],
      awaitWriteFinish: true,
    })

    watcherInstance.add('./**/*.js')
    ctx.watcher = watcherInstance
  },
})
