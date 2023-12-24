import { html, reactive } from '@arrow-js/core'
import { head } from 'nomen-js/head'

export function render(props) {
  const state = reactive({
    id: props.id,
    count: props.count,
  })
  return html`
    <p>Param ${() => state.id}</p>
    <p>Hello ${() => state.count}!</p>
    <button @click="${() => (state.count += 1)}">inc</button>
    <button @click="${() => (state.count -= 1)}">dec</button>
  `
}

export function onServer(context, [id]) {
  head({
    title: `Hello ${id}`,
  })
  return {
    id: id,
    count: 1003,
  }
}
