import { join } from 'node:path'
import { h, mount } from '../lib/create-element.js'
import { head } from 'nomen-js/head'
console.log('here', import.meta)

// head({
//   title: 'hello world',
//   links: [
//     {
//       rel: 'stylesheet',
//       href: './hello.css',
//     },
//   ],
// })

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
  const sum = 100 * 32 * 34
  return {
    props: {
      id: join(process.cwd(), '/home'),
      sum: sum,
    },
  }
}
