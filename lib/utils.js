exports.escapeRegExp = (string) => string.replace(/([.+?^${}()|[\]\\/])/g, '\\$1')
exports.isImportCall = (types, calleePath) => types.isImport(calleePath.node.callee)
exports.isRelative = (fpath) => (
  fpath.startsWith('./') || fpath.startsWith('../')
)

const matchesPattern = (types, calleePath, pattern) => {
  const { node } = calleePath

  if (types.isMemberExpression(node)) {
    return calleePath.matchesPattern(pattern)
  }

  if (!types.isIdentifier(node) || pattern.includes('.')) {
    return false
  }

  const name = pattern.split('.')[0]

  return node.name === name
}
exports.matchesTransformFn = (state, calleePath) => {
  const {
    transformFunctions
  } = state.runtimeOpts
  return transformFunctions.some((pattern) => (
    matchesPattern(state.types, calleePath, pattern)
  ))
}

/**
 * @param fn - The callback for generating the cache results
 * First param is the `key`, and should be an object or `null`/`undefined`
 */
exports.objKeyCache = (fn) => {
  const cache = new Map()

  const cb = (key, ...args) => {
    const cacheVal = cache.get(key)
    if (cacheVal) return cacheVal
    const results = fn(key, ...args)
    cache.set(key, results)
    return results
  }

  cb.clear = () => { cache.clear() }
  return cb
}

exports.stringKeyCache = (fn) => {
  let objCache = {}
  const cb = (key, ...args) => {
    if (objCache.hasOwnProperty(key)) return objCache[key]
    objCache[key] = fn(key, ...args)
    return objCache[key]
  }
  cb.clear = () => { objCache = {} }
  return cb
}
exports.shouldSkipNode = (node, state) => {
  const { skipModuleResolver } = state.runtimeOpts
  if (skipModuleResolver || state.resolverVisited.has(node)) {
    return true
  }
  return false
}
