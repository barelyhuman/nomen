import { html, reactive } from '@arrow-js/core';
import { Layout } from '../components/layout.js';

export const state = reactive({
  id: '',
  count: 0,
});

export function render() {
  return Layout(
    html`<title>Hello ${() => state.id}</title>`,
    html`
      <p>Param ${() => state.id}</p>
      <p>Hello ${() => state.count}!</p>
      <button @click="${() => (state.count += 1)}">inc</button>
      <button @click="${() => (state.count -= 1)}">dec</button>
    `
  );
}

export const onServer = (context, [id]) => {
  state.id = id;
};
