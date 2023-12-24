function rehydrate(render) {
  const json = document.getElementById('__nomen_meta').innerText
  const appContainer = document.getElementById('app')
  let innerState = {}
  try {
    innerState = JSON.parse(json)
  } catch (err) {}

  const mount = render(innerState)
  appContainer.innerHTML = ''
  mount(appContainer)
}
