import { html } from '@arrow-js/core';
import { Layout } from '../components/layout.js';

export default function view(context, [id]) {
  return Layout(html`<title>Hello Page</title>`, html`Hello ${id}!`);
}
