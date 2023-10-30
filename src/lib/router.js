export function toKey(method) {
  return method.trim().toLowerCase()
}

export function createRouter() {
  const routes = new Map()
  return {
    add: (method, route, handler, meta) =>
      add(routes, method, route, handler, meta),
    find: (method, route) => find(routes, method, route),
  }
}

function add(routerMap, method, route, handler, meta) {
  const key = toKey(method)
  const handlers = routerMap.get(key) || []
  let isDynamic = false
  let hasWildCard = false

  if (/\*/.test(route)) {
    isDynamic = true

    if (/\*{2}/.test(route)) {
      hasWildCard = true
    }
  }

  let _regex = route
    .replace(/[/](\*{2})/g, '[/]*(.*)')
    .replace(/[/]\*{1}/g, '[/](\\w+)')

  _regex = new RegExp(`${_regex}$`)

  handlers.push({
    route,
    routeRegex: new RegExp(_regex),
    hasWildCard,
    handler,
    isDynamic,
    meta,
  })

  handlers.sort((x, y) => {
    if (x.hasWildCard && x.isDynamic && y.hasWildCard && y.isDynamic) {
      return 0
    } else if (!x.hasWildCard && x.isDynamic && !y.hasWildCard && y.isDynamic) {
      return 0
    } else if (x.isDyanmic && !y.isDynamic) {
      return 1
    } else if (x.hasWildCard && !y.hasWildCard) {
      return 1
    }
    return -1
  })

  routerMap.set(key, handlers)
}

function find(routerMap, method, urlPath) {
  let params = []
  const handlerInfo = (routerMap.get(toKey(method)) || []).find(x => {
    if (x.route == urlPath) {
      return true
    }

    const isDynamic = x.routeRegex.test(urlPath)

    if (!isDynamic) {
      return false
    }

    params = urlPath.match(x.routeRegex).slice(1)

    return true
  })

  let result = null

  if (handlerInfo) {
    result = Object.assign({}, handlerInfo, {
      params: params ? params.map(x => x.split('/')).flat(2) : [],
    })
  }

  return result
}
