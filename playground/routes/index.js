import { html } from '@arrow-js/core';
import { Layout } from '../components/layout.js';

// export default function view() {
//   return Layout(html`<title>Root Page</title>`, html`Hello!`);
// }

export default function handler() {
  return {
    ping: 'pong',
  };
}
