/**
 * @param {object} modDef
 * @param {string} modDef.name
 * @param {(ctx:any)=>void|Promise<void>} modDef.onLoad
 * @param {(ctx:any)=>void|Promise<void>} modDef.onBoot
 * @returns {void}
 */
export function defineModule(modDef: {
  name: string
  onLoad: (ctx: any) => void | Promise<void>
  onBoot: (ctx: any) => void | Promise<void>
}): void
/**
 * @param {object} context
 * @returns {void}
 */
export function loadModules(context: object): void
