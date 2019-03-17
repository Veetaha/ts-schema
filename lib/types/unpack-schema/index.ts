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

type UnpackSchema_8<TSchema extends Schema> = UnpackSchemaWithoutSet<TSchema>;

type UnpackSchemaPredicate<TSchemaPredicate extends SchemaPredicate> = (
    I.UnpackTypePredicate<TSchemaPredicate> 
);

type UnpackSchemaObject<TSchemaObject extends SchemaObj> = I.MarkKeyOptionalIfUndefined<{
    [TKey in keyof TSchemaObject]: UnpackSchema<TSchemaObject[TKey]>;
}>;

interface UnpackSchemaArray<TArrayItems extends Schema[]> 
extends Array<UnpackSchema<TArrayItems[number]>>
{}

type UnpackSchemaWithoutSet<TSchema extends Schema> = (
    TSchema extends RegExp          ? string                         :
    TSchema extends 'string'        ? string                         :
    TSchema extends 'number'        ? number                         :
    TSchema extends 'boolean'       ? boolean                        :
    TSchema extends 'bigint'        ? bigint                         :
    TSchema extends 'undefined'     ? undefined                      :
    TSchema extends 'object'        ? I.Obj | null                   :
    TSchema extends 'function'      ? I.Func                         :
    TSchema extends 'symbol'        ? symbol                         :    
    TSchema extends SchemaArray     ? UnpackSchemaArray<TSchema>     :
    TSchema extends SchemaPredicate ? UnpackSchemaPredicate<TSchema> :
    TSchema extends SchemaObj       ? UnpackSchemaObject<TSchema>    : 
    never
);
type UnpackSchema_0<TSchema extends Schema> = (    
    TSchema extends SchemaSet      ? 
    UnpackSchemaSet_0<TSchema>  :
    UnpackSchemaWithoutSet<TSchema>
);
type UnpackSchemaSet_0<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_1<TItems> : never
    ) : never
);

type UnpackSchema_1<TSchema extends Schema> = (    
    TSchema extends SchemaSet      ? 
    UnpackSchemaSet_1<TSchema>  :
    UnpackSchemaWithoutSet<TSchema>
);
type UnpackSchemaSet_1<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_2<TItems> : never
    ) : never
);

type UnpackSchema_2<TSchema extends Schema> = (    
    TSchema extends SchemaSet      ? 
    UnpackSchemaSet_2<TSchema>  :
    UnpackSchemaWithoutSet<TSchema>
);
type UnpackSchemaSet_2<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_3<TItems> : never
    ) : never
);

type UnpackSchema_3<TSchema extends Schema> = (    
    TSchema extends SchemaSet      ? 
    UnpackSchemaSet_3<TSchema>  :
    UnpackSchemaWithoutSet<TSchema>
);
type UnpackSchemaSet_3<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_4<TItems> : never
    ) : never
);

type UnpackSchema_4<TSchema extends Schema> = (    
    TSchema extends SchemaSet      ? 
    UnpackSchemaSet_4<TSchema>  :
    UnpackSchemaWithoutSet<TSchema>
);
type UnpackSchemaSet_4<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_5<TItems> : never
    ) : never
);

type UnpackSchema_5<TSchema extends Schema> = (    
    TSchema extends SchemaSet      ? 
    UnpackSchemaSet_5<TSchema>  :
    UnpackSchemaWithoutSet<TSchema>
);
type UnpackSchemaSet_5<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_6<TItems> : never
    ) : never
);

type UnpackSchema_6<TSchema extends Schema> = (    
    TSchema extends SchemaSet      ? 
    UnpackSchemaSet_6<TSchema>  :
    UnpackSchemaWithoutSet<TSchema>
);
type UnpackSchemaSet_6<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_7<TItems> : never
    ) : never
);

type UnpackSchema_7<TSchema extends Schema> = (    
    TSchema extends SchemaSet      ? 
    UnpackSchemaSet_7<TSchema>  :
    UnpackSchemaWithoutSet<TSchema>
);
type UnpackSchemaSet_7<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_8<TItems> : never
    ) : never
);
