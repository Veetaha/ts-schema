import * as I from 'ts-typedefs';
import { ValidationOptions } from './validation';

// Type to type schema:

/**
 * Defines a type that maps properties of `TTargetObj` to `Schema`'s
 * 
 * @param TTargetObj Object type to define `Schema` for.
 * 
 * @remarks
 * ```ts
 * import * as Tsv from 'ts-schema-validator';
 * export interface Human {
 *     name: string;
 *     age:  number;
 * }
 * 
 * export const HumanSchema: Tsv.SchemaObj<Human> = {
 *     name: 'string',
 *     age:  Tsv.isPositiveInteger // everything is statically checked here
 * };
 * ```
 */
export type SchemaObj<TTargetObj extends I.Obj = I.Obj<any>> = {
    [TKey in keyof TTargetObj]: Schema<TTargetObj[TKey]>;
};

/**
 * Defines a schema array that describes `TTargetItems[]`.
 * @param TTargetItems Type of items of described array.
 */
export interface SchemaArray<TTargetItems = any> extends Array<Schema<TTargetItems>> {}

/**
 * Defines a schema set that describes a set of types target type may have.
 * @param TTarget Target type type define a set for.
 */
export interface SchemaSet<TTarget = any> extends Set<Schema<TTarget>> {}

/**
 * Defines a function that given a `suspect` returns `true` if it conforms to
 * `TTarget` and `false` otherwise.
 * @param TTarget Target type this predicate describes.
 * 
 * @param suspect         Value that this predicate validates
 * @param validateOptions Validate options forwarded to validating function that
 *                        invoked this type predicate.
 */
export type SchemaPredicate<
    TTarget = unknown
> = (suspect: unknown, validateOptions: ValidationOptions) => suspect is TTarget;


/**
 * Defines a type that describes another type's shape. 
 * It is accepted by `validate()` and `test()` functions.
 * This type is a meta-type, as it describes limitations over other types.
 * 
 * @param TTarget Type that defined `Schema` must describe.
 * 
 * @remarks
 * There exists a bunch of ways you may describe your type with `Schema`.
 * E.g. you can describe `number` type the following way:
 * ```ts
 * type Schema<number> = 
 *  | 'number' 
 *  | (suspect: unknown) => suspect is number
 *  | Set<Schema<number>> 
 * ```
 * So if you need to create a type description, use more specific subtype of it,
 * rather than using default union type.
 * 
 * There is a handy function `schema()` that preserves literally all types you used
 * to define your `Schema`, thus you may further retrieve the type,
 * that is described by your `Schema` without having to write it yourself.
 * If you want to get the described type from the given `Schema`,
 * see `UnpackSchema`.
 * 
 * Example:
 * ```ts
 * import * as Tsv from 'ts-schema-validator';
 * 
 * const NameSchema = Tsv.schema({
 *     first: 'string',
 *     last:  'string'
 * });
 * 
 * type Name = Tsv.UnpackSchema<typeof NameSchema>;
 * 
 * // statically generated TypeScript type:
 * // type Name === {
 * //     first: string;
 * //     last:  string;
 * // }
 * 
 * const JsonUserSchema = Tsv.schema({
 *     name:     NameSchema,
 *     password: /[a-zA-Z]{3,32}/,
 *     email:    (suspect): suspect is string => {
 *         // insert custom logic to check that suspect is an email string here
 *         return true;
 *     },
 *     cash:       Tsv.isInteger,
 *     isDisabled: 'boolean'
 * });
 * 
 * type JsonUser = Tsv.UnpackSchema<typeof JsonUserSchema>;
 * 
 * // statically generated TypeScript type:
 * // type JsonUser === {
 * //     name:       Name;
 * //     password:   string;
 * //     email:      string;
 * //     cash:       number;
 * //     isDisabled: boolean;
 * // }
 * ```
 */
export type Schema<TTarget = any> = (
    | SchemaPredicate<TTarget>
    | SchemaSet<TTarget>
    | ( 
        TTarget extends number    ? 'number'                                : 
        TTarget extends string    ? 'string' | RegExp                       :
        TTarget extends boolean   ? 'boolean'                               :
        TTarget extends bigint    ? 'bigint'                                :
        TTarget extends undefined ? 'undefined'                             :
        TTarget extends null      ? 'object'                                :
        TTarget extends symbol    ? 'symbol'                                :
        TTarget extends Function  ? 'function'                              :
        TTarget extends any[]     ? 'object' | SchemaArray<TTarget[number]> :
        TTarget extends I.Obj     ? 'object' | SchemaObj<TTarget>           :
        never
    )
);