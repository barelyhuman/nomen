/**
 * @param {string} namespaceId
 */
export function createContext(namespaceId: string): string;
/**
 * @param {string} namespaceId
 * @param {object} obj
 */
export function updateContext(namespaceId: string, obj: object): void;
/**
 * @param {string} namespaceId
 */
export function getCurrentContext(namespaceId: string): any;
