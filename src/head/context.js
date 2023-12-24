const headContext = new Map()

/**
 * @param {string} namespaceId
 */
export function createContext(namespaceId) {
  headContext.set(toKey(namespaceId), {})
  return namespaceId
}

/**
 * @param {string} namespaceId
 * @param {object} obj
 */
export function updateContext(namespaceId, obj) {
  const existing = headContext.get(toKey(namespaceId)) || {}
  const next = {
    ...existing,
    ...obj,
  }

  headContext.set(toKey(namespaceId), next)
}

/**
 * @param {string} namespaceId
 */
export function getCurrentContext(namespaceId) {
  const ctx = headContext.get(toKey(namespaceId))
  return ctx
}

/**
 * @param {string} namespaceId
 */
function toKey(namespaceId) {
  return namespaceId
}
