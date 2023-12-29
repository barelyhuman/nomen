const moduleGraph = new Map()

/**
 * @param {object} modDef
 * @param {string} modDef.name
 * @param {(ctx:any)=>void|Promise<void>} modDef.onLoad
 * @param {(ctx:any)=>void|Promise<void>} modDef.onBoot
 * @returns {void}
 */
export function defineModule(modDef) {
  moduleGraph.set(modDef.name, {
    loaded: false,
    mod: modDef,
    deps: modDef.dependsOn || [],
  })
}

/**
 * @param {object} context
 * @returns {void}
 */
export async function loadModules(context) {
  for (let currentModuleKey of moduleGraph.keys())
    try {
      const currentModuleDefinition = moduleGraph.get(currentModuleKey)
      if (currentModuleDefinition.loaded) continue

      for (let dependencyKey of currentModuleDefinition.deps) {
        const depModuleDefinition = moduleGraph.get(dependencyKey)
        if (depModuleDefinition.loaded) continue
        await depModuleDefinition.mod.onLoad(context)
        depModuleDefinition.loaded = true
        moduleGraph.set(dependencyKey, depModuleDefinition)
      }
      await currentModuleDefinition.mod.onLoad(context)
      currentModuleDefinition.loaded = true
      moduleGraph.set(currentModuleKey, currentModuleDefinition)
    } catch (err) {
      const mergedErr = new Error(`Error loading module: ${currentModuleKey}`)
      mergedErr.stack += `\n${err.stack}`
      throw mergedErr
    }

  for (let currentModuleKey of moduleGraph.keys())
    try {
      const currentModuleDefinition = moduleGraph.get(currentModuleKey)
      const modDef = currentModuleDefinition.mod
      if (!modDef.onBoot) continue
      await modDef.onBoot(context)
    } catch (err) {
      const mergedErr = new Error(`Error booting module: ${currentModuleKey}`)
      mergedErr.stack += `\n${err.stack}`
      throw mergedErr
    }
}
