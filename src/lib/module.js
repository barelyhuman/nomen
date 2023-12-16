const moduleGraph = new Map()

export function defineModule(modDef) {
  moduleGraph.set(modDef.name, {
    loaded: false,
    mod: modDef,
    deps: modDef.dependsOn || [],
  })
}

export async function loadModules(context) {
  for (let currentModuleKey of moduleGraph.keys()) {
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
  }

  for (let currentModuleKey of moduleGraph.keys()) {
    const currentModuleDefinition = moduleGraph.get(currentModuleKey)
    const modDef = currentModuleDefinition.mod
    if (!modDef.onBooted) continue

    await modDef.onBooted(context)
  }
}
