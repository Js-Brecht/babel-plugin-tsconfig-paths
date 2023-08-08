import path from "path"
import uniq from "lodash/uniq";

import { escapeRegExp, mergeAndMapKeys } from './utils'
import { getRootDir, getConfigPath, cacheTsPaths } from "./tsconfig";

import type { PluginOptions, RuntimeOptions } from "./types";

const defaultExtensions: string[] = ['.js', '.jsx', '.ts', '.tsx', '.es', '.es6', '.mjs']
const transformFunctions: string[] = [
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
const defaultOptions = {
  aliases: [],
  basePath: process.cwd(),
  configPath: "tsconfig.json",
  extensions: defaultExtensions,
  relative: true,
  transformFunctions: [],
  skipModuleResolver: false
}
const mapOptions = (newOptions: PluginOptions) => ({
  ...mergeAndMapKeys(defaultOptions, newOptions, {
    rootDir: "basePath",
  }),
})

const getTsconfigAliases = cacheTsPaths((tsconfig = {
  compilerOptions: {}
}) => {
  const aliases: { [key: string]: string[] } = tsconfig.compilerOptions?.paths || {}

  const resolveAliases: { alias: RegExp, transformers: string[] }[] = []

  Object.entries(aliases).forEach(([alias, resolutions]) => {
    const newAlias = new RegExp(`^${escapeRegExp(alias).replace(/\*/g, '(.+)')}`)
    const transformers = resolutions.map((res: string) => {
      for (let cnt = 1; res.indexOf("*") > -1; cnt++) {
        res = res.replace("*", `($${cnt})`)
      }
      return res
    })
    resolveAliases.push({
      alias: newAlias,
      transformers
    })
  })
  return resolveAliases
});

export const getOptions = (inputOpts = {} as PluginOptions): RuntimeOptions => {
  const opts = mapOptions(inputOpts);


  const rootDir = getRootDir(opts.basePath)
  const configPath = getConfigPath(opts.tsconfig, rootDir)
  const tsconfig = require(configPath)
  const base = tsconfig.compilerOptions.baseUrl || ''
  const basePath = path.isAbsolute(base)
    ? base
    : path.resolve(
      path.join(path.dirname(configPath), base)
    )

  return {
    configPath,
    basePath,
    aliases: getTsconfigAliases(tsconfig, rootDir),
    relative: opts.relative || true,
    // If the original import has an extension, then check for it, too, when
    // checking for existence of the file
    extensions: uniq(['', ...(opts.extensions || defaultExtensions)]),
    transformFunctions: opts.transformFunctions || transformFunctions,
    skipModuleResolver: !base
  }
}
