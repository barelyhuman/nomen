export const mount = (component, container) => {
  if (typeof container == 'string') {
    document.querySelector(container).appendChild(component)
    return
  }

  container.appendChild(component)
}

export const h = (el, attrs, ...children) => {
  const base = document.createElement(el)
  Object.keys(attrs).forEach(key => {
    if (typeof attrs[key] == 'object') {
      Object.assign(base[key], attrs[key])
    } else {
      base[key] = attrs[key]
    }
  })
  children.map(x => {
    if (typeof x === 'string') {
      x = document.createTextNode(x)
    }
    return base.appendChild(x)
  })
  return base
}
