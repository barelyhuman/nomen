import { join } from 'node:path';
import { defineModule } from '@nomen/module';

defineModule({
  name: 'nomen:root',
  async onLoad(ctx) {
    ctx.nomenOut = '.nomen';
    ctx.projectRoot = join(process.cwd());
  },
});
