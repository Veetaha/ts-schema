import { isPlainObject, Schema } from '../index';


/**
 * For internal use only
 */
export function stringifySchema(schema: Schema): string  {
    return stringifySchemaImpl(schema)
        .replace(/\\n|\\"|"/g, substr => substr === '\\n' ? '\n' : '');
}

/**
 * For internal use only
 */
function stringifySchemaImpl(schema: Schema): string {
    return (
        !isPlainObject(schema)           ? 
        schema                           : 
        schema instanceof Function       ?
        `<${schema.name}>`               :
        schema instanceof Set            ?
        [...schema.values()].map(stringifySchema).join(' | ') :
        schema instanceof RegExp         ?
        `/${schema.source}/`             :
        JSON.stringify(
            schema, 
            (_key, value: Schema) => (
                value instanceof Function  || 
                value instanceof Set       ||
                value instanceof RegExp    ? 
                stringifySchemaImpl(value) :
                value
            ),
            4
        )
    );
}