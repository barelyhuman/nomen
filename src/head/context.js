const headContext = new Map()

export function createContext(namespaceId) {
  headContext.set(toKey(namespaceId), {})
  return namespaceId
}

export function updateContext(namespaceId, obj) {
  const existing = headContext.get(toKey(namespaceId)) || {}
  const next = {
    ...existing,
    ...obj,
  }

  headContext.set(toKey(namespaceId), next)
}

export function getCurrentContext(namespaceId) {
  const ctx = headContext.get(toKey(namespaceId))
  return ctx
}

function toKey(namespaceId) {
  return namespaceId
}
