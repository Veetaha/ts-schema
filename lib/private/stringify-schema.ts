import * as I from 'ts-typedefs';
import { Schema, SchemaObj } from '../index';

export function stringifySchema(schema: Schema) {
    return JSON.stringify(createJsonCompatSchema(schema), null, 4);
}

// @TODO Create schema serialization module
enum SchemaType {
    Predicate = 'predicate',
    Array     = 'array',
    Union     = 'union',
    RegExp    = 'regexp',
    Obj       = 'obj'
}
type JsonCompatSchema = string | JsonCompatSchemaTagged;

interface JsonCompatSchemaTagged {
    type: SchemaType;
    schema: string | I.Obj<JsonCompatSchema> | JsonCompatSchema[];
}


function createJsonCompatSchemaObj(schemaObj: SchemaObj) {
    const result = {} as I.Obj<JsonCompatSchema>;
    for (const propName of Object.getOwnPropertyNames(schemaObj)) {
        result[propName] = createJsonCompatSchema(schemaObj[propName]);
    }
    return result;
}

function createJsonCompatSchemaArr(schemas: Iterable<Schema>): JsonCompatSchema[] {
    return [...schemas].map(createJsonCompatSchema);
}

function createJsonCompatSchema(schema: Schema): JsonCompatSchema {
    return  (
        typeof schema === 'string' ? schema :
        schema instanceof Function ? {
            type:   SchemaType.Predicate,
            schema: schema.name
        } :
        Array.isArray(schema) ? {
            type:   SchemaType.Array,
            schema: createJsonCompatSchemaArr(schema)
        } :
        schema instanceof Set ? {
            type:   SchemaType.Union,
            schema: createJsonCompatSchemaArr(schema.values())
        } :
        schema instanceof RegExp ? {
            type:   SchemaType.RegExp,
            schema: schema.source
        } : { 
            type:   SchemaType.Obj,
            schema: createJsonCompatSchemaObj(schema)
        }
    );  
}