import { defineModule } from '../lib/module.js'
import { getCurrentContext, updateContext, createContext } from './context.js'
import { namespace } from './utils.js'
export { stringify, head } from './utils.js'

defineModule({
  name: namespace,
  dependsOn: ['nomen:root'],
  async onLoad(moduleCtx) {
    createContext(namespace)
    moduleCtx.getHeadContext = () => getCurrentContext(namespace)
  },
})
