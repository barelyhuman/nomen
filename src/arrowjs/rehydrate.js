function rehydrate(state, render) {
  const json = document.getElementById('__nomen_meta').innerText
  const appContainer = document.getElementById('app')
  debugger
  const innerState = JSON.parse(json)
  if (innerState && state) {
    Object.assign(state, innerState)
  }
  const mount = render()
  appContainer.innerHTML = ''
  mount(appContainer)
}
