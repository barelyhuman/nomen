import { updateContext } from './context.js'

export const namespace = 'nomen:internal:html:head'

/**
 * @typedef {object} HeadOptions
 * @property {string} obj.title
 * @property {Array<Record<any,any>>} obj.meta
 * @property {Array<Record<any,any>>} obj.links
 */

/**
 * @param {HeadOptions} obj
 */
export function head(obj) {
  updateContext(namespace, obj)
}

/**
 * @param {HeadOptions} obj
 */
export function stringify(obj) {
  let result = ''
  if (obj.title) result += `<title>${obj.title}</title>\n`
  if (obj.links)
    for (let link of obj.links) {
      result += `<link `
      for (let [k, v] of Object.entries(link)) result += `${k}="${v}"`
      result += ` >`
    }

  if (obj.meta)
    for (let meta of obj.meta) {
      result += `<meta `
      for (let [k, v] of Object.entries(meta)) result += `${k}="${v}"`
      result += ` >`
    }

  return result
}
