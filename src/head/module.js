import { defineModule } from '../lib/module.js'
import { createContext, getCurrentContext } from './context.js'
import { namespace } from './utils.js'
export { head, stringify } from './utils.js'

defineModule({
  name: namespace,
  dependsOn: ['nomen:root'],
  async onLoad(moduleCtx) {
    createContext(namespace)
    moduleCtx.getHeadContext = () => getCurrentContext(namespace)
  },
})
