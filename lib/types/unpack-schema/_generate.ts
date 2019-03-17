import * as Fs from 'fs';

const totalCopies = 8;

let code = 
`import * as I from 'ts-typedefs';
import { SchemaPredicate, SchemaObj, Schema, SchemaSet, SchemaArray } from "../index";

/**
 * Defines a type that is described by the given ${'`'}TSchema${'`'} type description.
 * 
 * @param TSchema Type description to infer described type from.
 * 
 * @remarks
 * This type is basically inverse to ${'`'}Schema${'`'}, but not exactly.
 * Because of TypeScript circular types limitation enough nested ${'`'}SchemaSet${'`'}
 * type will cause to return ${'`'}never${'`'} type.
 * 
 * This type aspires to support to the following equality:
 *  ${'`'}UnpackSchema<Schema<T>> === T${'`'}
 * But it doesn't, because ${'`'}Schema<T>${'`'} must be a more specific 
 * subtype of ${'`'}Schema${'`'}. You should make it using ${'`'}schema()${'`'} function,
 * that preserves unit types.
 * 
 * See ${'`'}Schema${'`'} for more explanation.
 */
export type UnpackSchema<TSchema extends Schema> = UnpackSchema_0<TSchema>;

type UnpackSchema_${totalCopies}<TSchema extends Schema> = UnpackSchemaWithoutSet<TSchema>;

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
);`;

for (let i = 0; i < totalCopies; ++i) {
    code += (
`
type UnpackSchema_${i}<TSchema extends Schema> = (    
    TSchema extends SchemaSet      ? 
    UnpackSchemaSet_${i}<TSchema>  :
    UnpackSchemaWithoutSet<TSchema>
);
type UnpackSchemaSet_${i}<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_${i + 1}<TItems> : never
    ) : never
);
`
    );
}

Fs.writeFileSync(`${__dirname}/index.ts`, code);