import { Schema } from "./types";

/**
 * Noop function that leverages static type checking and preservation of unit types.
 * Though, you may use `value as const` cast syntax to preserve literal types,
 * using `schema()` will provide you better intellisence when defining your schemas.
 * This way you will be able to `UnpackSchema<>` in order to get described type.
 * 
 * ```ts
 * import * as Tsv from 'ts-schema-validator';
 * 
 * // first option
 * const UserSchema = Tsv.schema({
 *      id: 'number',               // you see helpful completions here
 *      name: /[A-Za-z]{6,32}/,  
 *      //       V~~~~~~~~~~~~~~~~~~~~ argument type is deduced to be of `unknown` type
 *      login: (suspect): suspect is string => { 
 *          // your custom logic here
 *      }
 * });
 * // Get your described type
 * type User = Tsv.UnpackSchema<typeof UserSchema>;
 * ```
 * 
 * 
 * @param schemaDefinition Schema object to return.
 */
export function schema<TSchema extends Schema>(schemaDefinition: TSchema) {
    return schemaDefinition;
}

/**
 * Creates a set of schemas that represents a union of type shapes that the described
 * value may have. You should prefer to use this function instead of vanilla
 * new Set(possibleSchemas) as it returns the right type of schema and preserves
 * literal types.
 *  
 * @param possibleSchemas Arguments array of possible schemas for the target type. 
 *                        The described type must match to at least one of them.
 * 
 * @remarks
 * 
 * You may nest your sets, it won't change the result, but it is superfluous and 
 * should be avoided, however `schemaSet('number', 'string')` will behave the
 * same way as `schemaSet(schemaSet(schemaSet('number'), schemaSet('string')))`.
 * 
 * How you should declare type union schema:
 * 
 * ```ts
 * // The wrong way:
 * // `typeof idSchema1 === Set<string | { id: string }>`
 * const idSchema1 = new Set(['number', { id: 'number' }]);
 * 
 * test(idSchema1, 22); // compile error (schemaSet type didn't preserve literal types)
 * 
 * // The right way:
 * // `typeof idSchema2 === Set<'number' | { id: 'number' }>`
 * const idSchema2 = schemaSet('number', { id: 'number' });
 * 
 * test(idSchema2, 22); // compiles well
 * ```
 */
export function schemaSet<TSchemas extends Schema[]>(...possibleSchemas: TSchemas) {
    return new Set<TSchemas[number]>(possibleSchemas);
}
