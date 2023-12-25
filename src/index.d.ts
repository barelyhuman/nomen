/**
 *
 * @param {typeof defaultConfig} options
 * @returns
 */
export function createNomen(options?: typeof defaultConfig): {
    boot: (server: any) => Promise<void>;
    handler: (context: any) => Promise<any>;
};
export { defineModule };
import { defaultConfig } from './lib/config.js';
import { defineModule } from './lib/module.js';
