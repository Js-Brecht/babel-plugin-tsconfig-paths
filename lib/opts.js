const fs = require('fs')
const path = require('path')
const jsonc = require('jsonc').safe
const {
  objKeyCache,
  stringKeyCache,
  escapeRegExp
} = require('./utils')

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.es', '.es6', '.mjs']
const transformFunctions = [
  'require',
  'require.resolve',
  'System.import',
  'jest.genMockFromModule',
  'jest.mock',
  'jest.unmock',
  'jest.doMock',
  'jest.dontMock',
  'jest.setMock',
  'require.requireActual',
  'require.requireMock'
]

const getTsconfigAliases = (tsconfig = {
  compilerOptions: {}
}) => {
  const aliases = tsconfig.compilerOptions.paths || {}

  const resolveAliases = Object.entries(aliases).reduce((
    arr,
    [alias, resolutions]
  ) => {
    const aliasPattern = new RegExp(`^${escapeRegExp(alias).replace(/\*/g, '(.*?)')}`)
    const transformers = resolutions.map((res) => {
      let cnt = 1
      while (res.indexOf('*') > -1) {
        res = res.replace('*', `$${cnt++}`)
      }
      return res
    })
    arr.push({
      alias: aliasPattern,
      transformers
    })
  }, [])
  return resolveAliases
}

const getConfig = stringKeyCache((path) => {
  try {
    const rawConfig = fs.readFileSync(path, 'utf-8')
    const tsconfig = jsonc.parse(rawConfig)
    return {
      tsconfig,
      aliases: getTsconfigAliases(tsconfig)
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Unable to read tsconfig; file does not exist: ${path}`)
    }
    throw err
  }
})

exports.getOptions = objKeyCache((opts) => {
  const configPath = path.resolve(
    opts.rootDir || process.cwd(),
    opts.tsconfig || 'tsconfig.json'
  )

  const { tsconfig, aliases } = getConfig(configPath)
  const base = tsconfig.compilerOptions.baseUrl || ''
  const basePath = path.isAbsolute(base)
    ? base
    : path.resolve(
      path.join(
        path.dirname(configPath),
        base
      )
    )

  return {
    configPath,
    basePath,
    aliases,
    relative: opts.relative == null ? true : opts.relative,
    extensions: opts.extensions || extensions,
    transformFunctions: opts.transformFunctions || transformFunctions,
    skipModuleResolver: !base
  }
})
