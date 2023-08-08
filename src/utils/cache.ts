import { AnyFunction, AnyObject } from "../types";

/**
 * Caches the result of a function that returns a string.
*
* @param {Fn} fn - The function to be cached.
* @return {FnRet} The cached result of the function.
*/
export function cacheTransformString<
  Fn extends (...args: any[]) => any,
  FnRet extends ReturnType<Fn> extends string ? Fn : never
>(fn: Fn): FnRet {
  let cachedVal: ReturnType<Fn> | null = null;

  return ((...args: Parameters<Fn>) => {
    if (cachedVal != null) return cachedVal;
    cachedVal = fn(...args);
    return cachedVal;
  }) as FnRet;
};

export const keyedCache = <Fn extends AnyFunction>(fn: Fn) => {
  type CacheType = Record<string, ReturnType<Fn>>;
  let objCache = {} as CacheType;

  type FnParams = Readonly<Parameters<Fn>>;
  type CbParameters = Parameters<Fn>[0] extends string ? Readonly<Parameters<Fn>>
    : readonly [cacheKey: string, ...FnParams: FnParams]

  const cb = (...args: CbParameters) => {
    const cacheKey = args[0];
    const cbArgs = args.slice(1) as FnParams;
    if (objCache.hasOwnProperty(cacheKey)) return objCache[cacheKey]!;
    objCache[cacheKey] = fn(cacheKey, ...cbArgs)
    return objCache[cacheKey]!
  }
  cb.clear = () => { objCache = {} }
  return cb
}