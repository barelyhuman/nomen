import { html, reactive } from '@arrow-js/core'
import { Layout } from '../components/layout.js'
import { head } from 'nomen-js/head'

export const state = reactive({
  id: '',
  count: 0,
})

export function render() {
  return html`
    <p>Param ${() => state.id}</p>
    <p>Hello ${() => state.count}!</p>
    <button @click="${() => (state.count += 1)}">inc</button>
    <button @click="${() => (state.count -= 1)}">dec</button>
  `
}

export const onServer = (context, [id]) => {
  state.id = id
  state.count = 1000
  head({
    title: `Hello ${state.id}`,
  })
}
