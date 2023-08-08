import path from "path";
import { cacheTransformString } from "./utils";
import { CachedTsPathsFn, TsConfig } from "./types";

/**
 * Retrieves the root directory.
 * If no argument is provided, it defaults to the current working directory.
 * If the argument is a relative path, it resolves it to an absolute path.
 * @param {string} str - The directory path.
 * @returns {string} - The root directory path.
 */
export const getRootDir = cacheTransformString((str: string): string => {
  if (!str) str = process.cwd() // if no argument is provided, use the current working directory
  if (!path.isAbsolute(str)) {
    str = path.resolve(
      path.join(process.cwd(), str) // resolve the relative path to an absolute path
    )
  }
  return str
})

/**
 * Returns the path to the configuration file.
 *
 * @param config - The relative or absolute path to the configuration file. Defaults to 'tsconfig.json'.
 * @param root - The root directory to resolve the configuration file path. Defaults to the current working directory.
 * @returns The resolved path to the configuration file.
 */
export const getConfigPath = cacheTransformString((config = 'tsconfig.json', root = process.cwd()): string => {
  if (!path.isAbsolute(config)) {
    // Resolve the relative configuration path relative to the root directory
    config = path.resolve(
      path.join(root, config)
    )
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
  };
};