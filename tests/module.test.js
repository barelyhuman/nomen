import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { defineModule, loadModules } from '../src/lib/module.js';

test('basic load module', async () => {
  const ctx = {};
  defineModule({
    name: 'basic',
    onLoad() {
      ctx.value = 1;
    },
  });
  await loadModules(ctx);
  assert.is(ctx.value, 1);
});

test('load dependent module first, irrespective of definition order', async () => {
  const ctx = {};
  defineModule({
    name: 'basic-2',
    dependsOn: ['basic'],
    onLoad() {
      if (ctx.value == 1) {
        ctx.value = 3;
      }
    },
  });
  defineModule({
    name: 'basic',
    onLoad() {
      ctx.value = 1;
    },
  });
  await loadModules(ctx);
  assert.is(ctx.value, 3);
});

test.run();
