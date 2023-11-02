import process from 'node:process'

const headContext = new Map()

process.nomenContext = headContext

export function createContext(namespaceId) {
  process.nomenContext.set(toKey(namespaceId), {})
  return namespaceId
}

export function updateContext(namespaceId, obj) {
  const existing = process.nomenContext.get(toKey(namespaceId)) || {}
  const next = {
    ...existing,
    ...obj,
  }

  process.nomenContext.set(toKey(namespaceId), next)
}

export function getCurrentContext(namespaceId) {
  const ctx = process.nomenContext.get(toKey(namespaceId))
  return ctx
}

function toKey(namespaceId) {
  return namespaceId
}
