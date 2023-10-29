function rehyrdate(state) {
  const json = document.querySelector('script#_meta').innerHTML
  const appContainer = document.getElementById('app')
  const innerState = JSON.parse(json)
  if (innerState && state) {
    Object.assign(state, innerState)
  }
  // @ts-expect-error a global declaration
  const mount = render()
  appContainer.innerHTML = ''
  mount(appContainer)
}
