import { h } from '../lib/create-element.js'

export async function render() {
  const lumeScript = h(
    'script',
    {
      type: 'module',
    },
    `
  import { defineElements } from 'https://esm.sh/lume@0.3.0-alpha.35?bundle'
      defineElements()
  `
  )

  const scene = h(
    'lume-scene',
    {
      webgl: true,
    },
    h('lume-box', {
      size: '100 100 100',
      alignPoint: '0.5 0.5',
      mountPoint: '0.5 0.5',
    })
  )

  const style = document.createElement('style')
  const css = String.raw

  style.innerHTML = css`
    html,
    body,
    #app {
      height: 100%;
      margin: 0;
      background: white;
    }
  `

  document.head.appendChild(style)

  const app = document.body
  document.querySelector('#app').appendChild(scene)
  app.appendChild(lumeScript)
}

export function onServer(ctx, params) {
  return {
    props: {},
  }
}
