export default {
  '/': () => import('./routes/index.js'),
  '/preact/*': () => import('./routes/preact-component.js'),
  '/arrow/*': () => import('./routes/arrow-component.js'),
}
