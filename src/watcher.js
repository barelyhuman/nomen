import { defineModule } from './lib/module.js'
import chokidar from 'chokidar'

defineModule({
  name: 'nomen:watcher',
  dependsOn: ['nomen:root'],
  async onLoad(ctx) {
    if (!ctx.env.NOMEN_DEV) return

    const watcherInstance = chokidar.watch()
    ctx.watcher = watcherInstance
  },
  onBooted(ctx) {
    if (!ctx.env.NOMEN_DEV) return

    /**@type {chokidar.FSWatcher}*/
    const watcher = ctx.watcher
    watcher.on('all', change => {
      console.log({ change })
    })
  },
})
