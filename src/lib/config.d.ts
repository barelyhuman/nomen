type ModuleFuncs = () => void

export namespace defaultConfig {
  const root: string
  const routes: {}
  const modules: ModuleFuncs[]
  namespace template {
    const entry: any
    namespace placeholders {
      const head: string
      const content: string
      const scripts: string
    }
  }
  const assets: {
    baseURL: string
    dir: string
    maxAge: number
  }[]
  const routeNotFoundTemplate: any
  namespace client {
    namespace esbuildOptions {
      const jsx: string
      const jsxImportSource: string
      const loader: {
        '.js': string
      }
    }
  }
}
