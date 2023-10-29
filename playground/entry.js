import { createNomen, enableArrowJS } from 'nomen';
import routes from './routes.js';
import { createServer } from '@hattip/adapter-node';

const nomen = createNomen({
  routes: routes,
});

enableArrowJS();

await nomen.boot();

createServer(nomen.handler).listen(3000, () => {
  console.log(`Listening on http://localhost: 3000`);
});
