import path from "path"
import fs from "fs";
import uniq from "lodash/uniq";
import JSON5 from "json5";
import type { Simplify } from "type-fest";

import { escapeRegExp, mergeAndMapKeys, resolveFile, getRootDir } from './utils'
import { getConfigPath, cacheTsPaths, getTsConfig } from "./tsconfig";

import type { PluginOptions, ResolverFnOptions, RuntimeOptions } from "./types";

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
const defaultOptions: RuntimeOptions = {
  aliases: [],
  basePath: process.cwd(),
  configPath: "tsconfig.json",
  extensions: defaultExtensions,
  relative: true,
  transformFunctions: [],
  skipModuleResolver: false,
  keepSourceExt: false,
}
const mapOptions = (newOptions: PluginOptions) => ({
  ...mergeAndMapKeys(defaultOptions, newOptions, {
    rootDir: "basePath",
  }),
})

const getConfigResolverOptions = <
  O extends ResolverFnOptions,
  R = Simplify<Omit<O, "strict"> & { strict: O["strict"] extends true ? true : false; }>
>(options: O): R => ({ strict: false, ...options } as R);

export const getOptions = (inputOpts = {} as PluginOptions): RuntimeOptions => {
  const opts = mapOptions(inputOpts);


  const rootDir = getRootDir(opts.basePath)
  const configResolverOptions = getConfigResolverOptions({
    basePath: rootDir,
    extensions: ["", "json"],
    strict: true,
    keepSourceExt: opts.keepSourceExt,
  });
  const tsconfigPath = resolveFile(inputOpts.tsconfig || "tsconfig.json", configResolverOptions);
  const { tsconfig, aliases } = getTsConfig(tsconfigPath, configResolverOptions)

  const configPath = getConfigPath(opts.tsconfig, rootDir)
  const base = tsconfig.compilerOptions?.baseUrl || ''
  const basePath = path.isAbsolute(base)
    ? base
    : path.resolve(
      path.join(path.dirname(configPath), base)
    )

  return {
    configPath,
    basePath,
    aliases,
    keepSourceExt: opts.keepSourceExt == null ? false : opts.keepSourceExt,
    relative: opts.relative == null ? true : opts.relative,
    extensions: uniq(['', ...(opts.extensions || defaultExtensions)]),
    transformFunctions: opts.transformFunctions || transformFunctions,
    skipModuleResolver: !base
  }
}
