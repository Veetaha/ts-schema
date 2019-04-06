import * as I from 'ts-typedefs';
import { PathArray, Schema } from './index';
import { stringifySchema } from './private/stringify-schema';

/**
 * Data container for `TypeMismatch` constructor.
 */
export type TypeMismatchData<
    TSchema extends Schema = Schema
> = Pick<TypeMismatch<TSchema>, 'path' | 'actualValue' | 'expectedSchema'>;


/**
 * Represents the result of running `validate(schema, suspect, ...)` function if it
 * `suspect` failed to match to `schema`.
 * 
 * @remarks
 * It contains information about the reason why `suspect` doesn't match to 
 * the given `schema`: `actualValue`, `expectedSchema` and a property `path` to unexpected value type.
 */
export class TypeMismatch<TSchema extends Schema = Schema> {
    /**
     *  An array of numbers and/or strings which defines a path to suspect's 
     *  invalid `actualValue`. 
     *  @remarks
     *  E.g. if `suspect.foo.bar[3][5]` failed to match to `expectedSchema`, 
     *  then `path` would be `[ 'foo', 'bar', 3, 5 ]`.
     */
    path: PathArray;
    /**
     * Schema that `actualValue` was expected to match to.
     */
    expectedSchema: TSchema;
    /**
     * Value that failed to match to the `expectedSchema`.
     */
    actualValue: unknown;

    /**
     * Creates an instance of `TypeMismatch`, takes on object with data properties.
     * You should never use it as it is used only internally.
     * @param data Object which contains data describing type mismatch.
     */
    constructor(data: TypeMismatchData<TSchema>) { 
        this.path           = data.path;
        this.expectedSchema = data.expectedSchema;
        this.actualValue    = data.actualValue;
    }

    private static isJsIdentifier(suspect: string) {
        return /^[a-zA-Z$_][\w\d$_]*$/.test(suspect);
    }

    /**
     * Returns path converted to a human readable JavaScript 
     * property access notation.
     * Returned string begins with the 'root' as the root object to access 
     * the properties.
     * 
     * @remarks
     * ```ts
     * import * as Tsv from 'ts-schema-validator';
     * const mismatch = Tsv.validate(
     *     { foo: { bar: { 'twenty two': [ { prop: 'string' } ] } } },
     *     { foo: { bar: { 'twenty two': [ { prop: 'str' }, { prop: -23 } ] } } }
     * );
     * 
     * mismatch.pathString() === `root.foo.bar['twenty two'][1].prop`;
     * ```
     */
    pathString() {
        return this.path.reduce((result, currentPart) => (
            `${result}${
                typeof currentPart === 'string'                    ? (
                TypeMismatch.isJsIdentifier(String(currentPart)) ? 
                `.${currentPart}`                                : 
                `['${currentPart}']`                               ) :
                `[${currentPart}]`
            }`), 
            'root'
        );
    }

    /**
     * 
     * Returns a string of form:
     * "value (JSON.stringify(actualValue)) at 'pathString()' failed to match
     * to the given schema (stringifySchema(expectedSchema))"
     * 
     * @remarks
     * If `JSON.stringify(actualValue)` throws an error, it is excluded 
     * from the returned string.
     */
    toErrorString() {
        let valueRepr: I.Nullable<string>;
        try { valueRepr = JSON.stringify(this.actualValue); } 
        finally {}

        return `value ${valueRepr != null ? ` (${valueRepr})` : ''} at '${
            this.pathString()
        }' failed to match to the given schema (${stringifySchema(this.expectedSchema)})`;
    }
}
