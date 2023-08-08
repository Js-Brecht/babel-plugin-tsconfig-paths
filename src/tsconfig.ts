import path from "path";
import fs from "fs";
import JSON5 from "json5";
import { cacheTransformString, keyedCache } from "./utils";
import { CachedTsPathsFn, RuntimeOptions, TsConfig, Alias, ResolverFnOptions } from "./types";
import { isCodedError } from "./utils/errors";
import { escapeRegExp } from "lodash";


/**
 * Returns the path to the configuration file.
 *
 * @param config - The relative or absolute path to the configuration file. Defaults to 'tsconfig.json'.
 * @param root - The root directory to resolve the configuration file path. Defaults to the current working directory.
 * @returns The resolved path to the configuration file.
 */
export const getConfigPath = cacheTransformString((config = 'tsconfig.json', root = process.cwd()): string => {
  if (!path.isAbsolute(config)) {
    // Try require.resolve() first!
    try {
      config = require.resolve(config);
    } catch (err) {
      // Resolve therelative configuration path relative to the root directory
      config = path.resolve(
        path.join(root, config)
      )
    }
  }
  return config
});

const tsConfigCache = new Map<TsConfig, any>();
/**
 * Caches the TypeScript paths for a given tsconfig file.
 *
 * @param {CachedTsPathsFn} fn - The fn used to fetch the Typescript paths to cache.
 * @return {TsConfigPaths} - The tsconfig.paths from the tsconfig file.
 */
export function cacheTsPaths<Fn extends CachedTsPathsFn>(fn: Fn) {
  return (tsconfig: TsConfig, root: string): ReturnType<Fn> => {
    const cachedConfig = tsConfigCache.get(tsconfig);
    if (cachedConfig) return cachedConfig;
    const tsconfigPaths = fn(tsconfig, root);
    tsConfigCache.set(tsconfig, tsconfigPaths);
    return tsconfigPaths;
  }
};

const getTsconfigAliases = cacheTsPaths((tsconfig = {
  compilerOptions: {}
}, root): Alias[] => {
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

export const getTsConfig = keyedCache((tsconfigPath: string, opts: ResolverFnOptions): {
  tsconfig: TsConfig, aliases: Alias[]
} => {
  try {
    const rawConfig = fs.readFileSync(tsconfigPath, 'utf-8')
    let [err, tsconfig] = JSON5.parse(rawConfig)
    if (err) throw err

    if (tsconfig.compilerOptions && tsconfig.compilerOptions.baseUrl) {
      tsconfig.compilerOptions.baseUrl = path.resolve(
        tsconfigPath,
        tsconfig.compilerOptions.baseUrl
      )
    }

    if (tsconfig.extends) {
      const extendPath = path.resolve(
        path.dirname(tsconfigPath),
        tsconfig.extends
      )

      const {
        tsconfig: newTsconfig = {}
      } = getTsConfig(extendPath, opts) || {}

      tsconfig = {
        ...newTsconfig,
        ...tsconfig,
        compilerOptions: {
          ...newTsconfig.compilerOptions || {},
          ...tsconfig.compilerOptions || {}
        }
      }
    }

    return {
      tsconfig,
      aliases: getTsconfigAliases(tsconfig, opts.basePath)
    }
  } catch (err) {
    if (isCodedError(err, 'ENOENT')) {
      throw new Error(`Unable to read tsconfig; file does not exist: ${path}`)
    }
    throw err
  }
})