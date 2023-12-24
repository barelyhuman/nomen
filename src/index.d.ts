export function createNomen(options?: {}): {
    boot: (server: any) => Promise<void>;
    handler: (context: any) => Promise<any>;
};
export { defineModule };
import { defineModule } from './lib/module.js';
