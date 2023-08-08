import * as path from "path";
import * as fs from "fs";
import { attempt, reduce } from "lodash";
import { RuntimeOptions } from "../types";


type ResolverFn = (pathname: string, opts: RuntimeOptions) => string | Error | null;
const resolvers: ResolverFn[] = [
  function fsPath(pathname, opts) {

    function checkPath(curpathname: string, ext: string | null): string | Error | null {
      if (ext != null)
        curpathname = pathname + ext.replace(/^\.*(.*)/, '.$1');
      const stat = fs.statSync(pathname);

      if (stat) {
        if (stat.isSymbolicLink()) {
          return fsPath(fs.readlinkSync(pathname), opts);
        }
        if (stat.isDirectory()) {
          return fsPath(path.join(pathname, 'index'), opts);
        }
      }

      return !!stat ? pathname : null;
    }

    let result: string | Error | null = null;
    for (const ext of opts.extensions) {
      result = checkPath(pathname, ext);
      if (result) break;
    }
    return result;
  },

  function nodeModules(pathname, opts) {
    return require.resolve(pathname);
  }
]

type ResolveFileReducer = ResolverFn extends (...args: infer A) => infer R
  ? (...args: A) => Exclude<R, Error> : never;

export const resolveFile: ResolveFileReducer = (function resolveFile(pathname: string, opts: RuntimeOptions) {
  for (const fn of resolvers) {
    const result = attempt(fn, pathname, opts);
    if (result && result instanceof Error) {
      Error.captureStackTrace(result, resolveFile);
      throw Error;
    }
    return result;
  }
}) as ResolveFileReducer

/**
 * Returns the relative path from the 'from' directory to the 'to' path.
 *
 * @param {string} from - The directory path to start from.
 * @param {string} to - The path to which the relative path is calculated.
 * @return {string} The relative path from the 'from' directory to the 'to' path.
 */
export const getRelativePath = (from: string, to: string): string => {
  const relPath = path.relative(
    path.dirname(from),
    to
  )

  return relPath.startsWith('./') || relPath.startsWith('../')
    ? relPath
    : `./`
}