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
- [x] Bundle Chunker
- [x] Plugin API (mostly just a layer atop esbuild's plugin API)
- [ ] Adaptors for various server renderers
  - [x] ArrowJS
  - [ ] Preact
- [ ] Page Head Support
- [ ] Custom Template (_index.html_)
- [ ] Custom 404 Page
- [ ] Custom Error Page
- [ ] Usage Documentation
- [ ] Faster Builds
- [ ] Pre-rendering module spec
- [ ] Typings (Last thing to do)

## Alternatives / Similar Solutions

- [AdonisJS](http://adonisjs.com) - no-nonsense full stack framework for
  Typescript(Javascript)
- [rakkasjs](http://rakkasjs.org) - A react based framework built on
  [vite](https://vite.dev) and [hattip](https://hattipjs.org)
