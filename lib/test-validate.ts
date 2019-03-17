import { Schema, UnpackSchema, ValidationOptions } from "./index";

import { Validator } from './private/validator';

/**
 * Determines whether the specified `suspect` type satisfies the restriction of the given `schema`.
 * @param TTarget   TypeScript type `suspect` is treated as, if this function returns `true`.
 * @param suspect   Entity of `unknown` type to be tested for having the shape according to `schema`.
 * @param schema    If it is a basic JavaScript typename string (should satisfy typeof operator
 *                  domain definition), then function returns `typeof suspect === schema`.
 *                  If it is a `RegExp`, then returns
 *                  `typeof suspect === 'string' && schema.test(suspect)`.
 *                  Else if it is a `Set<Schema>`, returns `true` if `suspect` matches to at
 *                  least one of the given `Schema`s in `Set`.
 *                  Else if it is an `Array<Schema>` and it consists of one item,
 *                  returns `true` if `suspect` is `Array` and each of its items 
 *                  matches to the given `schema[0]`.
 *                  Else if it is an `Array<Schema>` and it consists of more than one item,
 *                  returns `true` if `suspect` is `Array` and `suspect.length === schema.length`
 *                  and each `suspect[i]` matches to `schema[i]`.
 *                  Else if it is an empty `Array`, returns `true` if `suspect` is `Array` of `any` type.
 *                  Else if it is an `object`, returns `true` if `suspect` is an `object` and
 *                  each `schema[key]` matches to `suspect[key]` and if 
 *                  `options.allowExcessProps === true`, and `suspect` doesn't have properties, 
 *                  that are not present in `schema`.
 *                  Else if it is a `SchemaPredicate`, then returns `schema(suspect)`.
 *                  Else returns `false`.
 * @param options   Additional configurations.
 * @remarks
 * ```ts
 * import * as Tss from 'ts-schema';
 * 
 * Tss.test(
 * {
 *        prop:  'string',
 *        tel:   /\d{4}-\d{3}-\d{2}-\d{2}/, // claims a string of given format
 *        prop2: 'boolean',
 *        obj: {
 *            innerObj: ['number', 'boolean'] // claims a fixed length tuple
 *        }
 * }, {
 *        prop:  'lala',
 *        tel:   '8800-555-35-35'
 *        prop2: true,
 *        obj: {
 *            innerObj: [23, false]
 *        },
 *        someIDontCareProperty: null // excess properties are ok by default
 * }); // true
 * 
 * Tss.test(
 * {
 *      arr:    [],                            // claims an array of any type
 *      strArr: ['string'],                    // claims an array of any length
 *      oneOf:  new Set(['boolean', 'number']),// claims to be one of these types
 *      custom: isOddNumber                    // custom type predicate function
 * }, {
 *      arr:    ['array', null, 'of any type', 8888 ],
 *      strArr: ['Pinkie', 'Promise', 'some', 'strings'],
 *      oneOf:  2,
 *      custom: 43
 * }); // true
 * 
 * function isOddNumber(suspect: unknown): suspect is number {
 *     return typeof suspect === 'number' && suspect % 2;
 * }  
 * 
 * const HumanSchema = Tss.schema({  // noop function that preserves unit types
 *     name: 'string',
 *     id:   'number'
 * });
 * 
 * // generate static TypeScript type:
 * type Human = Tss.UnpackSchema<typeof HumanSchema>;
 * 
 * // type Human === {              
 * //     name: string;
 * //     id:   number;
 * // }
 * 
 * function tryUseHuman(maybeHuman: unknown) {
 *     if (Tss.test(HumanSchema, maybeHuman)) {
 *         // maybeHuman is of type that is assignable to Human here
 *         // it is inferred to be Tss.UnpackSchema<typeof HumanSchema> exactly
 *         maybeHuman.name;
 *         maybeHuman.id;
 *     }
 * }
 * 
 * ```
 */
export function test
<TSchema extends Schema>
(
    schema:  TSchema,
    suspect: unknown,  
    options: ValidationOptions = {}
): suspect is UnpackSchema<TSchema> {
    return !validate(schema, suspect, options);
}


/**
 * Returns `null` or `TypeMismatch` object that stores information about type 
 * incompatability according to the given `schema`. 
 * 
 * @param suspect Value of `unknown` type to be tested for conformance to `schema`.
 * @param schema  `Schema` that describes limitations that must be
 *                applied to `suspect` to pass the match
 *                (see `test()` for more info about the structure of `Schema`).
 * @param options Additional configurations.
 * 
 * @remarks
 * `TypeMismatch` stores information about why and where 
 * `suspect`'s invalid property is. If `suspect` passed the validation 
 * this function returns `null`. This is a powerful tool to generate useful 
 * error messages while validating value shape type. 
 * ```ts
 *   import * as Tss from 'ts-schema';
 *   const untrustedJson = {}; // some value
 *   const ExpectedJsonSchema: Tss.Schema = {}; //some type schema
 *   const dbEntity = {}; // some database entity
 *
 *   const mismatch = Tss.validate(ExpectedJsonSchema, untrustedJson);
 *   if (mismatch != null) {
 *       console.log(
 *           mismatch.path,
 *           mismatch.actualValue,
 *           mismatch.expectedSchema
 *       );
 *       // logs human readable path to invalid property
 *       console.log(mismatch.pathString());
 *
 *       // `mismatch.toErrorString()` generates human readable error message
 *       throw new Tss.TypeMismatchError(mismatch);
 *   }
 *   // now you may safely assign untrustedJson to dbEntity:
 *   dbEntity = Object.assign(dbEntity, untrustedJson);
 * ```
 */
export function validate(
    schema:  Schema, 
    suspect: unknown, 
    options: ValidationOptions = {}
) {
    return new Validator(options).validate(schema, suspect);
}
