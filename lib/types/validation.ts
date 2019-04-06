/**
 * Validation configuration data.
 */
export interface ValidationOptions {
    /**
     * Specifies whether objects with excess properties that are not specified
     * in `Schema<>` will pass the validation or not.
     */
    readonly noExcessProps?: boolean;
}

/**
 * An array of numbers and/or strings which defines a linear path through JavaScript
 * objects and arrays.
 */ 
export type PathArray = (string | number)[];