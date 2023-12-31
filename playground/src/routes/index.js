import { join } from 'node:path'
import { h, mount } from '../lib/create-element.js'
import { head } from 'nomen-js/head'

export function render({ props }) {
  const rawComponent = h(
    'div',
    {
      style: {
        color: 'red',
      },
    },
    h('p', {}, `data from server ${props.id}`),
    h('p', {}, `Sum is: ${props.sum}`)
  )

  mount(rawComponent, '#app')
}

export function onServer(ctx, params) {
  head({
    title: 'hello world',
  })
  const sum = 100 * 32 * 34
  return {
    props: {
      id: join(process.cwd(), '/home'),
      sum: sum,
    },
  }
}
