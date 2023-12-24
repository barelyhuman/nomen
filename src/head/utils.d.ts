/**
 * @typedef {object} HeadOptions
 * @property {string} obj.title
 * @property {Array<Record<any,any>>} obj.meta
 * @property {Array<Record<any,any>>} obj.links
 */
/**
 * @param {HeadOptions} obj
 */
export function head(obj: HeadOptions): void;
/**
 * @param {HeadOptions} obj
 */
export function stringify(obj: HeadOptions): string;
export const namespace: "nomen:internal:html:head";
export type HeadOptions = {
    title: string;
    meta: Array<Record<any, any>>;
    links: Array<Record<any, any>>;
};
