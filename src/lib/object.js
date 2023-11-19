export function getAllPaths(obj) {
  let tails = []
  Object.keys(obj).forEach(k => {
    if (typeof obj[k] === 'object') {
      const paths = getAllPaths(obj[k]).map(x => [k].concat(x).join('.'))
      tails = tails.concat(paths)
    } else {
      tails.push(k)
    }
  })
  return tails
}

export function merge(obj, defaultObj) {
  const final = {}
  const _targetPaths = getAllPaths(obj)
  const _sourcePaths = getAllPaths(defaultObj)
  const uniquePaths = []

  _targetPaths.concat(_sourcePaths).reduce((acc, item) => {
    if (acc.has(item)) return acc
    uniquePaths.push(item)
    acc.add(item)
    return acc
  }, new Set())

  uniquePaths.forEach(p => {
    const sourceValue = getPath(defaultObj, p)
    const targetValue = getPath(obj, p)
    if (!targetValue) setPath(final, p, sourceValue)
    else setPath(final, p, targetValue)
  })

  return final
}

function _parsePath(posPath) {
  let lexicalTokens = []
  let currentLex = ''
  posPath.split('').map(token => {
    if (token === '.') {
      lexicalTokens.push(currentLex)
      currentLex = ''
      return
    }

    if (token === '[') {
      lexicalTokens.push(currentLex)
      currentLex = ''
      return
    }

    if (token === ']') {
      lexicalTokens.push(currentLex)
      currentLex = ''
      return
    }

    currentLex += token
  })

  if (currentLex.length > 0) lexicalTokens.push(currentLex)

  return lexicalTokens.filter(x => x)
}

function _safeGet(obj, key) {
  if (typeof obj !== 'object') return false

  return obj[key]
}

export function getPath(obj, obj_path) {
  const _path = _parsePath(obj_path)
  console.log({ _path })
  let pointer = obj
  let partial = false
  _path.forEach((p, i) => {
    const exists = _safeGet(pointer, p)
    if (!exists) {
      partial = true
      return
    }
    pointer = exists
  })

  if (partial) return false
  return pointer
}

export function setPath(obj, obj_path, value) {
  const _path = _parsePath(obj_path)
  let pointer = obj
  let delegated = false

  _path.forEach((p, i) => {
    if (delegated) return
    if (i === _path.length - 1) {
      pointer[p] = value
      return
    }

    const exists = _safeGet(pointer, p)

    if (!exists) {
      const nextO = {}
      setPath(nextO, _path.slice(i + 1).join('.'), value)
      delegated = true
      pointer[p] = nextO
      return
    }
    pointer = exists
  })

  return true
}
