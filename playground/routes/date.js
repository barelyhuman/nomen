import path from 'node:path'

export function get() {
  return new Response(path.join('hello', 'world', new Date().toISOString()))
}
