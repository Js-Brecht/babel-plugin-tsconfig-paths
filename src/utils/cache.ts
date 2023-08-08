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