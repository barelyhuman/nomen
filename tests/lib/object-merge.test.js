import { test } from 'uvu'
import { getAllPaths, getPath, merge, setPath } from '../../src/lib/object.js'
import * as assert from 'uvu/assert'

test('get simple', () => {
  const obj = {
    a: 1,
  }
  assert.equal(getPath(obj, 'a'), obj.a)
})

test('get nested level 1', () => {
  const obj = {
    a: {
      b: 1,
    },
  }
  assert.equal(getPath(obj, 'a.b'), obj.a.b)
})

test('get nested level array', () => {
  const obj = {
    a: {
      b: [{ c: 1 }],
    },
  }
  assert.equal(getPath(obj, 'a.b[0].c'), obj.a.b[0].c)
})

test('set simple', () => {
  const obj = {}
  setPath(obj, 'a', 1)
  assert.equal(obj.a, 1)
})

test('set nested level 1', () => {
  const obj = {
    a: {
      b: undefined,
    },
  }
  setPath(obj, 'a.b', 2)
  assert.equal(obj.a.b, 2)
})

test('set non-existent property', () => {
  const obj = {
    a: {},
  }
  setPath(obj, 'a.b.c', 2)

  assert.equal(Object.keys(obj), ['a'])
  assert.equal(Object.keys(obj.a), ['b'])
  assert.equal(Object.keys(obj.a.b), ['c'])
  assert.equal(obj.a.b.c, 2)
})

test('get tail paths', () => {
  const obj = { a: 1 }
  assert.equal(getAllPaths(obj), ['a'])
})

test('get tail paths nested', () => {
  const obj = {
    a: 1,
    b: {
      d: 1,
    },
  }
  assert.equal(getAllPaths(obj), ['a', 'b.d'])
})

test('get tail paths nested', () => {
  const obj = {
    a: 1,
    b: {
      d: 1,
    },
  }
  assert.equal(getAllPaths(obj), ['a', 'b.d'])
})

test('get tail paths nested level 2', () => {
  const obj = {
    a: 1,
    b: {
      d: 1,
      e: {
        a: 1,
      },
    },
  }
  assert.equal(getAllPaths(obj), ['a', 'b.d', 'b.e.a'])
})

test("don't get tail paths for arrays", () => {
  const obj = {
    prop: [1, 2, 3],
    b: {
      prop: [1, 2, 3],
    },
  }
  assert.equal(getAllPaths(obj), ['prop', 'b.prop'])
})

test('get tail paths for arbitrary keys', () => {
  const obj = {
    '.js': 1,
  }
  assert.equal(getAllPaths(obj), ['.js'])
})

test('merge simple', () => {
  const userConfig = {
    a: 1,
  }

  const defaultConfig = {
    a: 2,
  }

  const mergedConfig = merge(userConfig, defaultConfig)

  assert.equal(mergedConfig.a, userConfig.a)
})

test('merge nested', () => {
  const userConfig = {
    routes: {
      '/': () => import('./x.js'),
    },
    modules: [],
    template: {
      entry: `hello`,
    },
  }

  const defaultConfig = {
    routes: {},
    modules: [],
    template: {
      entry: `hello world`,
      placeholders: {
        head: '<!-- app-head-placeholder -->',
        content: '<!-- app-content-placeholder -->',
        scripts: '<!-- app-scripts-placeholder -->',
      },
    },
    client: {
      esbuildOptions: {
        jsx: 'automatic',
        jsxImportSource: 'preact',
        loader: {
          '.js': 'jsx',
        },
      },
    },
  }

  const mergedConfig = merge(userConfig, defaultConfig)
  assert.equal(mergedConfig.template.entry, userConfig.template.entry)
  assert.equal(
    mergedConfig.template.placeholders,
    defaultConfig.template.placeholders
  )
  assert.equal(
    mergedConfig.client.esbuildOptions.loader['.js'],
    defaultConfig.client.esbuildOptions.loader['.js']
  )
})

test.run()
