import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { createRouter } from '../src/lib/router.js'

test('basic add route', async () => {
  const router = createRouter()
  const handler = () => {}
  router.add('get', '/hello', handler)
  const handlerD = router.find('get', '/hello')
  assert.equal(handlerD.route, '/hello')
  assert.equal(handlerD.handler, handler)
})

test('basic add param route', async () => {
  const router = createRouter()
  const handler = () => {}
  router.add('get', '/hello/*', handler)
  const handlerD = router.find('get', '/hello/1')
  assert.equal(handlerD.route, '/hello/*')
  assert.equal(handlerD.handler, handler)
  assert.equal(handlerD.params, ['1'])
})

test('basic add param route, invalid find', async () => {
  const router = createRouter()
  const handler = () => {}
  router.add('get', '/hello/*', handler)
  const handlerD = router.find('get', '/hello')
  assert.not.ok(handlerD)
})

test('basic add param wild card', async () => {
  const router = createRouter()
  const handler = () => {}
  router.add('get', '/hello/**', handler)

  const handlerD = router.find('get', '/hello/12/123')
  assert.equal(handlerD.route, '/hello/**')
  assert.equal(handlerD.handler, handler)
  assert.equal(handlerD.params, ['12', '123'])
})

test('basic add param wild card,invalid find', async () => {
  const router = createRouter()
  const handler = () => {}
  router.add('get', '/hello/**', handler)

  const handlerD = router.find('get', '/123/12/123')
  assert.not.ok(handlerD)
})

test('overload static and param', async () => {
  const router = createRouter()
  const handler = () => {}

  router.add('get', '/hello/**', handler)
  router.add('get', '/hello/humans', handler)

  const handlerD = router.find('get', '/hello/humans')
  const handlerD2 = router.find('get', '/hello/random/words')

  assert.equal(handlerD.route, '/hello/humans')
  assert.equal(handlerD.handler, handler)
  assert.equal(handlerD.params, [])

  assert.equal(handlerD2.route, '/hello/**')
  assert.equal(handlerD2.handler, handler)
  assert.equal(handlerD2.params, ['random', 'words'])
})

test('root route discard', async () => {
  const router = createRouter()
  const handler = () => {}
  router.add('get', '/component/*', handler)
  router.add('get', '/', handler)
  const handlerD = router.find('get', '/component/2')
  assert.equal(handlerD.route, '/component/*')
  assert.equal(handlerD.handler, handler)
})

test('root route discard test 2', async () => {
  const router = createRouter()
  const handler = () => {}
  router.add('get', '/', handler)
  router.add('get', '/component/*', handler)
  router.add('get', '/api/date', handler)
  const handlerD = router.find('get', '/component/2')
  assert.equal(handlerD.route, '/component/*')
  assert.equal(handlerD.handler, handler)
})

test('route full match, match end', async () => {
  const router = createRouter()
  const handler = () => {}
  router.add('get', '/user', handler)
  router.add('get', '/userhello/*', handler)
  const handlerD = router.find('get', '/userhello')
  assert.not.ok(handlerD)
})

test('route full match, match start', async () => {
  const router = createRouter()
  const handler = () => {}
  router.add('get', '/', handler)
  router.add('get', '/userhello/*', handler)
  const handlerD = router.find('get', '/userhello/')
  assert.not.ok(handlerD)
})

test('router wildcard for assets', async () => {
  const router = createRouter()
  const handler = () => {}
  const handlerWrong = () => {}
  router.add('get', '/.nomen/**', handler)
  router.add('get', '/.nomen', handlerWrong)
  const handlerD = router.find('get', '/.nomen/file/chunk')
  assert.equal(handlerD.route, '/.nomen/**')
  assert.equal(handlerD.handler, handler)
})

test.run()
