import * as I from 'ts-typedefs';
import { SchemaPredicate, SchemaObj, Schema, SchemaSet, SchemaArray } from "../index";


/**
 * Defines a type that is described by the given `TSchema` type description.
 * 
 * @param TSchema Type description to infer described type from.
 * 
 * @remarks
 * This type is basically inverse to `Schema`, but not exactly.
 * Because of TypeScript circular types limitation enough nested `SchemaSet`
 * type will cause to return `never` type.
 * 
 * This type aspires to support to the following equality:
 *  `UnpackSchema<Schema<T>> === T`
 * But it doesn't, because `Schema<T>` must be a more specific 
 * subtype of `Schema`. You should make it using `schema()` function,
 * that preserves unit types.
 * 
 * See `Schema` for more explanation.
 */
export type UnpackSchema<TSchema extends Schema> = UnpackSchema_0<TSchema>;

type UnpackSchema_3<_TSchema extends Schema> = never;

type UnpackSchemaPredicate<
    TSchemaPredicate extends SchemaPredicate
> = TSchemaPredicate extends (suspect: unknown, ...args: any[]) => suspect is infer TTarget ? TTarget : never;

type UnpackTypeName<TTypeName extends I.TypeName> = {
    string:    string;
    number:    number;
    boolean:   boolean;
    bigint:    bigint;
    undefined: undefined;
    object:    I.Obj | null;
    function:  I.Func<unknown[], unknown, unknown>;
    symbol:    symbol;
}[TTypeName];

type UnpackSchemaWithoutCircularRef<TSchema extends Schema> = (
    TSchema extends RegExp          ? string                         :
    TSchema extends I.TypeName      ? UnpackTypeName<TSchema>        :
    TSchema extends SchemaPredicate ? UnpackSchemaPredicate<TSchema> :
    never
);
type UnpackSchema_0<TSchema extends Schema> = (    
    TSchema extends SchemaSet   ? UnpackSchemaSet_0<TSchema>    :
    TSchema extends SchemaArray ? UnpackSchemaArray_0<TSchema>  :
    TSchema extends SchemaObj   ? UnpackSchemaObject_0<TSchema> : 
    UnpackSchemaWithoutCircularRef<TSchema>
);
type UnpackSchemaObject_0<TSchemaObject extends SchemaObj> = I.MarkKeyOptionalIfUndefined<{
    [TKey in keyof TSchemaObject]: UnpackSchema_1<TSchemaObject[TKey]>;
}>;

type UnpackSchemaSet_0<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_1<TItems> : never
    ) : never
);

interface UnpackSchemaArray_0<TSchemaArray extends Schema[]> 
extends Array<UnpackSchema_1<I.UnpackArray<TSchemaArray>>>
{}


type UnpackSchema_1<TSchema extends Schema> = (    
    TSchema extends SchemaSet   ? UnpackSchemaSet_1<TSchema>    :
    TSchema extends SchemaArray ? UnpackSchemaArray_1<TSchema>  :
    TSchema extends SchemaObj   ? UnpackSchemaObject_1<TSchema> : 
    UnpackSchemaWithoutCircularRef<TSchema>
);
type UnpackSchemaObject_1<TSchemaObject extends SchemaObj> = I.MarkKeyOptionalIfUndefined<{
    [TKey in keyof TSchemaObject]: UnpackSchema_2<TSchemaObject[TKey]>;
}>;

type UnpackSchemaSet_1<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_2<TItems> : never
    ) : never
);

interface UnpackSchemaArray_1<TSchemaArray extends Schema[]> 
extends Array<UnpackSchema_2<I.UnpackArray<TSchemaArray>>>
{}


type UnpackSchema_2<TSchema extends Schema> = (    
    TSchema extends SchemaSet   ? UnpackSchemaSet_2<TSchema>    :
    TSchema extends SchemaArray ? UnpackSchemaArray_2<TSchema>  :
    TSchema extends SchemaObj   ? UnpackSchemaObject_2<TSchema> : 
    UnpackSchemaWithoutCircularRef<TSchema>
);
type UnpackSchemaObject_2<TSchemaObject extends SchemaObj> = I.MarkKeyOptionalIfUndefined<{
    [TKey in keyof TSchemaObject]: UnpackSchema_3<TSchemaObject[TKey]>;
}>;

type UnpackSchemaSet_2<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_3<TItems> : never
    ) : never
);

interface UnpackSchemaArray_2<TSchemaArray extends Schema[]> 
extends Array<UnpackSchema_3<I.UnpackArray<TSchemaArray>>>
{}

