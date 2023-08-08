import { merge, mapKeys, has } from "lodash";

/**
 * Escapes special characters in a string to be used in a regular expression.
 *
 * @param {string} string - The input string to escape.
 * @return {string} The escaped string.
 */
export const escapeRegExp = (string: string) => {
  const escapedString = string.replace(/[.+?^${}()|\[\]\/]/g, "\\$&");
  return escapedString;
};

type MappedKeys<
  O1, O2, MapKeys extends Partial<Record<keyof O2, keyof O1>>
> = Omit<O2, keyof MapKeys> & O1
/**
* Maps keys from one object to another object based on a key mapping.
*
* @param {T1} orig - The original object with keys to map.
* @param {T2} newObj - The new object to map the keys to.
* @param {Record<keyof T1, keyof T2>} keyMapping - The mapping of keys from the original object to the new object.
* @returns {T2} The new object with mapped keys.
*/
export function mergeAndMapKeys<
  T1 extends Record<keyof any, any>,
  T2 extends Record<keyof any, any>,
  MapKeys extends Partial<Record<keyof T2, keyof T1>>,
  Ret = MappedKeys<T1, T2, MapKeys>
>(
  orig: T1, newObj: T2, keyMapping: MapKeys
): Ret {
  const doMapping = <T extends Record<keyof any, any>>(obj: T) =>
    mapKeys(obj, k => has(keyMapping, [k]) ? keyMapping[k] : k);

  return merge({}, doMapping(orig), doMapping(newObj)) as Ret;
}