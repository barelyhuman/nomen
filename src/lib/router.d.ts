/**
 * @param {"GET"|"POST"|"PUT"|"DELETE"|string} method
 * @returns {string}
 */
export function toKey(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | string
): string
export function createRouter(): {
  /**
   * @param {string} method
   * @param {string} route
   * @param {any} handler
   * @param {object} meta
   */
  add: (method: string, route: string, handler: any, meta: object) => void
  /**
   * @param {string} method
   * @param {string} route
   */
  find: (method: string, route: string) => any
}
