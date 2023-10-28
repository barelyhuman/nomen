function rehyrdate(state) {
  const json = document.querySelector('script#_meta').innerHTML;
  const appContainer = document.getElementById('app');
  const innerState = JSON.parse(json);
  if (innerState && state) {
    Object.assign(state, innerState);
  }
  const mount = render();
  appContainer.innerHTML = '';
  mount(appContainer);
}
