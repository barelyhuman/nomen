const moduleGraph = new Map()

export function defineModule(modDef) {
  moduleGraph.set(modDef.name, {
    loaded: false,
    mod: modDef,
    deps: modDef.dependsOn || [],
  })
}

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
      if (!modDef.onBooted) continue
      await modDef.onBooted(context)
    } catch (err) {
      const mergedErr = new Error(`Error booting module: ${currentModuleKey}`)
      mergedErr.stack += `\n${err.stack}`
      throw mergedErr
    }
}
