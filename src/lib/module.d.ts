/**
 * @param {object} modDef
 * @param {string} modDef.name
 * @param {(ctx:any)=>void|Promise<void>} modDef.onLoad
 * @param {(ctx:any)=>void|Promise<void>} modDef.onBooted
 * @returns {void}
 */
export function defineModule(modDef: {
    name: string;
    onLoad: (ctx: any) => void | Promise<void>;
    onBooted: (ctx: any) => void | Promise<void>;
}): void;
/**
 * @param {object} context
 * @returns {void}
 */
export function loadModules(context: object): void;
