import { Schema } from "../types";
import { schemaSet } from "../schema";

function isNull(suspect: unknown): suspect is null {
    return suspect === null;
}


/**
 * The same as `optional(nullable(optNullableSchema))`. Returned schema target type
 * is `null | undefined | UnpackSchema<TSchema>`.
 * 
 * @param optNullableSchema Schema to unite with `null | undefined`.
 */
export function optionalNullable<TSchema extends Schema>(optNullableSchema: TSchema) {
    return schemaSet(isNull, 'undefined', optNullableSchema);
}

/**
 * Returns a schema set that describes a value that may be of 
 * `null | UnpackSchema<TSchema>` type.
 * 
 * @param nullableSchema Schema to unite with `null`.
 */
export function nullable<TSchema extends Schema>(nullableSchema: TSchema) {
    return schemaSet(isNull, nullableSchema);
}

/**
 * Returns a schema set that describes a value that may be of 
 * `undefined | UnpackSchema<TSchema>` type. If you make a schema object with a 
 * property that has `optional()` schema it means that this property may be
 * absent in the described value.
 * 
 * @param nullableSchema Schema to unite with `undefined`.
 */
export function optional<TSchema extends Schema>(optionalSchema: TSchema) {
    return schemaSet('undefined', optionalSchema);
}
