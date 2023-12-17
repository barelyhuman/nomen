// import { dirname } from 'node:path'
// import { fileURLToPath } from 'node:url'
import esbuild from 'esbuild'
import { defineModule } from '../lib/module.js'
import path, { basename, dirname, join } from 'node:path'
import { createRequire } from 'module'
import fs from 'fs/promises'

const require = createRequire(import.meta.url)

export function hmr() {
  defineModule({
    name: 'nomen:builders:hmr',
    dependsOn: ['nomen:builders:vanilla'],
    async onLoad(moduleContext) {
      moduleContext.handlers.push(ctx => {
        console.log(ctx)
      })

      const chunkOutDir = join(
        moduleContext.packageRoot,
        moduleContext.nomenOut,
        'client-chunks'
      )
      console.log()
      const hmrAssetsDir = path.resolve(
        require.resolve('@plainjs/hmr'),
        '../..'
      )
      console.log(hmrAssetsDir)

      await fs.cp(hmrAssetsDir, path.join(chunkOutDir, '@plainjs'), {
        force: true,
        recursive: true,
      })
      const routeOutputs = []

      for (let entry of moduleContext.routerEntries) {
        const outputPath = path.join(
          chunkOutDir,
          path.relative(
            path.join(moduleContext.packageRoot, 'routes'),
            entry.path
          )
        )
        const content = await fs.readFile(outputPath, { encoding: 'utf8' })
        await fs.writeFile(
          outputPath,
          `
import { createHotContext } from '/.nomen/client-chunks/@plainjs/hmr/hmr.js'
import.meta.hot = createHotContext(import.meta.url)
        \n
        ` + content
        )
      }
    },
  })
}
