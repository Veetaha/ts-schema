import * as I from 'ts-typedefs';

// Type to type schema:

/**
 * Defines a type that maps properties of `TTargetObj` to `Schema`'s
 * 
 * @param TTargetObj Object type to define `Schema` for.
 * 
 * @remarks
 * ```ts
 * import * as Tss from 'ts-schema';
 * export interface Human {
 *     name: string;
 *     age:  number;
 * }
 * 
 * export const HumanSchema: Tss.SchemaObj<Human> = {
 *     name: 'string',
 *     age:  Tss.isPositiveInteger // everything is statically checked here
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
export interface SchemaSet  <TTarget      = any> extends Set<Schema<TTarget>>      {}

/**
 * Defines a function that given a `suspect` returns `true` if it conforms to
 * `TTarget` and `false` otherwise.
 * @param TTarget Target type this predicate describes.
 */
export type SchemaPredicate<TTarget = never> = TTarget extends never
    ? (this: void, suspect: unknown) => boolean 
    : (this: void, suspect: unknown) => suspect is TTarget;



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
 * import * as Tss from 'ts-schema';
 * 
 * const NameSchema = Tss.schema({
 *     first: 'string',
 *     last:  'string'
 * });
 * 
 * type Name = Tss.UnpackSchema<typeof NameSchema>;
 * 
 * // statically generated TypeScript type:
 * // type Name === {
 * //     first: string;
 * //     last:  string;
 * // }
 * 
 * const JsonUserSchema = Tss.schema({
 *     name:     NameSchema,
 *     password: /[a-zA-Z]{3,32}/,
 *     email:    (suspect): suspect is string => {
 *         // insert custom logic to check that suspect is an email string here
 *         return true;
 *     },
 *     cash:       Tss.isInteger,
 *     isDisabled: 'boolean'
 * });
 * 
 * type JsonUser = Tss.UnpackSchema<typeof JsonUserSchema>;
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
        TTarget extends number           ? 'number'                       : 
        TTarget extends string           ? 'string' | RegExp              :
        TTarget extends boolean          ? 'boolean'                      :
        TTarget extends bigint           ? 'bigint'                       :
        TTarget extends undefined        ? 'undefined'                    :
        TTarget extends null             ? 'object'                       :
        TTarget extends symbol           ? 'symbol'                       :
        TTarget extends Function         ? 'function'                     :
        TTarget extends (infer TItems)[] ? 'object' | SchemaArray<TItems> :
        TTarget extends I.Obj            ? 'object' | SchemaObj<TTarget>  :
        never
    )
);