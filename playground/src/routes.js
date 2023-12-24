export default {
  '/': () => import('./routes/index.js'),
  '/lume/**': () => import('./routes/lume.js'),
  '/preact/*': () => import('./routes/preact-component.js'),
  '/arrow/*': () => import('./routes/arrow-component.js'),
}
