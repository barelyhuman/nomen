# nomen-js

`nomen` is a minimal but extensible framework for server based applications.

## Goal

A no build solution with pure ESM to write API's and Frontend Interactive Views
while not being tied to a specific web framework. We aren't trying to solve a
hundred problems with the framework.

The entire framework is based off of a module loading system which is meant to
be flexible enough to be able to add in any kind of rendering engine atop an API
Server

That's it. I'm not trying to create and fix imaginary problems. Most of them
have already been solved and can be reused with `nomen-js`

Think of it as another "One Man fullstack framework" in the JS land

# Todo

- [x] Module Loader
- [x] Server Kernel
- [x] ESBuild Core Transformer
- [x] Render Adaptor definition
- [x] Rendering Engine
  - [x] Vanilla JS Client Hydration
- [x] Bundle Chunker
- [x] Plugin API (mostly just a layer atop esbuild's plugin API)
- [x] Adaptors for various server renderers
  - [x] ArrowJS
  - [x] Preact
  - [x] VanillaJS
- [ ] Page Head Support
- [x] Custom Template (_index.html_)
- [ ] Custom 404 Page
- [ ] Custom Error Page
- [ ] Usage Documentation
- [ ] Faster Builds
- [ ] Pre-rendering module spec
- [ ] Typings (Last thing to do)
- [ ] Cross Runtimes Execution (Node, Deno, Bun, etc)

## Alternatives / Similar Solutions

- [AdonisJS](http://adonisjs.com) - no-nonsense full stack framework for
  Typescript(Javascript)
- [rakkasjs](http://rakkasjs.org) - A react based framework built on
  [vite](https://vite.dev) and [hattip](https://hattipjs.org)

## Development

- Make sure you have [nvm](https://github.com/nvm-sh/nvm) installed

**Setup Node Version**

```sh
nvm install
nvm use
node -v // v18.16.0
```

**Setup repository and dependencies**

```sh
npm i -g pnpm@8.6.2
pnpm i
```

**Run Development**

There's no build tooling, the repository is just a collection of ESM modules
that get imported by the node runtime.

**Run Playground**

```sh
cd playground
pnpm dev
```
