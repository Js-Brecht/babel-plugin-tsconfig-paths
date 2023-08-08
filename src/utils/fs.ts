import path from "path";
import fs from "fs";
import { attempt } from "lodash";
import { Maybe, ResolveFileReducer, ResolverFn, ResolverFnOptions, RuntimeOptions } from "../types";
import { cacheTransformString } from "./cache";
import { mergeAndMapKeys } from "./general";

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
 * Attempts to resolve a pathname using different file extensions.
 * @param pathname - The original pathname to resolve.
 * @param options - The resolver options.
 * @param cb - The resolver function.
 * @returns The resolved result or an error if resolution fails.
 */
export const tryExtensions = (pathname: string, options: ResolverFnOptions, cb: ResolverFn) => {
  // Save the original pathname
  const origPathname = pathname;

  // Iterate over each file extension
  for (const ext of options.extensions) {
    // Append the file extension to the pathname
    const curPathname = origPathname + `.${ext.replace(/^\.*/, '')}`;

    // Attempt to resolve the current pathname
    const result = attempt(cb, curPathname, options);

    // If resolution fails, return the result or an error
    if (!result || result instanceof Error) {
      return result;
    }
  }
}

const resolvers: ResolverFn[] = [
  function nodeModules(pathname, opts) {
    return tryExtensions(pathname, opts, (curpathname) => attempt(require.resolve, curpathname))
  },

  function fsPath(pathname, opts) {
    const checkPath: ResolverFn = (curpathname, opts) => {
      const stat = fs.statSync(curpathname);

      if (stat) {
        if (stat.isSymbolicLink()) {
          return fsPath(fs.readlinkSync(curpathname), opts);
        }
        if (stat.isDirectory()) {
          return fsPath(path.join(curpathname, 'index'), opts);
        }
      }

      return !!stat ? curpathname : null;
    }

    return tryExtensions(pathname, opts, checkPath);
  },
]

type FileResolverRetBase = Maybe<string | Error>;
type FileResolverRet<O extends ResolverFnOptions> = O["strict"] extends true ? string : FileResolverRetBase;
/**
 * Resolves a file based on the given pathname and options.
 * 
 * @param pathname - The pathname of the file to resolve.
 * @param opts - The resolver options.
 * @returns The resolved file.
 * @throws Error if the file cannot be located and strict mode is enabled.
 */
export const resolveFile = function resolveFile<
  O extends ResolverFnOptions, Ret = FileResolverRet<O>
>(pathname: string, opts: O): Ret {
  const options = mergeAndMapKeys({
    strict: true,
    keepSourceExt: true,
  }, opts, {})

  const errors: Error[] = [];

  let result: FileResolverRetBase = null;
  for (
    let i = 0;
    (
      i <= resolvers.length
      && !result || (typeof result === "string" && result.length > 0)
    );
    i++
  ) {
    const resolver = resolvers[i]!;

    result = attempt(resolver, pathname, options);
    if (result && result instanceof Error) {
      Error.captureStackTrace(result, resolveFile);
      errors.push(result);
    }
  }

  if (!!opts.strict && !result) {
    const err = new Error("Unable to locate file at: " + pathname);
    Error.captureStackTrace(err, resolveFile);
    errors.push(err);
  }

  if (errors.length && !!opts.strict) {
    throw errors[0];
  }

  if (typeof result === "string" && !opts.keepSourceExt) {
    result = path.join(path.dirname(pathname), path.basename(result, path.extname(pathname)));
  }

  return result as Ret;
}


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