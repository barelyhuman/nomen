import { defineModule } from '../lib/module.js'
import { createContext, getCurrentContext, updateContext } from './context.js'

const namespace = 'nomen:internal:html:head'

defineModule({
  name: namespace,
  dependsOn: ['nomen:root'],
  async onLoad(moduleCtx) {
    const headContext = createContext(namespace)
    moduleCtx.getHeadContext = () => getCurrentContext(namespace)
  },
})

export function head(obj) {
  updateContext(namespace, obj)
}
