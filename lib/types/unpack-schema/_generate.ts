import * as Fs from 'fs';

const totalCopies = 3;

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

type UnpackSchema_${totalCopies}<_TSchema extends Schema> = never;

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
);`;

for (let i = 0; i < totalCopies; ++i) {
    code += (
`
type UnpackSchema_${i}<TSchema extends Schema> = (    
    TSchema extends SchemaSet   ? UnpackSchemaSet_${i}<TSchema>    :
    TSchema extends SchemaArray ? UnpackSchemaArray_${i}<TSchema>  :
    TSchema extends SchemaObj   ? UnpackSchemaObject_${i}<TSchema> : 
    UnpackSchemaWithoutCircularRef<TSchema>
);
type UnpackSchemaObject_${i}<TSchemaObject extends SchemaObj> = I.MarkKeyOptionalIfUndefined<{
    [TKey in keyof TSchemaObject]: UnpackSchema_${i + 1}<TSchemaObject[TKey]>;
}>;

type UnpackSchemaSet_${i}<TSchemaSet extends SchemaSet> = (
    TSchemaSet extends Set<infer TItems> ? (
        TItems extends Schema ? UnpackSchema_${i + 1}<TItems> : never
    ) : never
);

interface UnpackSchemaArray_${i}<TSchemaArray extends Schema[]> 
extends Array<UnpackSchema_${i + 1}<I.UnpackArray<TSchemaArray>>>
{}

`
    );
}

Fs.writeFileSync(`${__dirname}/index.ts`, code);