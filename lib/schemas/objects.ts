import * as I from 'ts-typedefs';

/**
 * Returns `true` if `suspect` is not null or undefined and 
 * `typeof suspect === 'object'` or `'function'`.
 * 
 * @param suspect Value of `unknown` type to check.
 */
export function isPlainObject(suspect: unknown): suspect is I.Obj {
    return Boolean(
        suspect != null && (typeof suspect === 'object' || typeof suspect === 'function')
    );
}