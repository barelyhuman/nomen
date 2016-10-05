import { join } from 'node:path';
import { defineModule } from '@nomen/module';

defineModule({
  name: 'nomen:root',
  async onLoad(ctx) {
    ctx.projectRoot = join(process.cwd());
  },
});
