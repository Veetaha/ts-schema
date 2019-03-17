import * as I from 'ts-typedefs';
import { 
    PathArray, TypeMismatch, Schema, ValidationOptions, isPlainObject, 
    SchemaObj, SchemaSet
} from '../index';

/**
 * For internal use only.
 */
export class Validator {
    private readonly currentPath: PathArray = [];
    
    constructor(options: ValidationOptions) {
        if (options.noExcessProps) {
            this.validateObject = this.validateObjectWithNoExcessProps;
        }
    }
    
    private makeTypeMismatch(actualValue: unknown, expectedSchema: Schema) {
        return new TypeMismatch({ 
            actualValue, 
            expectedSchema, 
            path: [ ...this.currentPath ] 
        });
    }

    private validateArray(suspect:   unknown[], getSchema: (index: number) => Schema) {
        for (let i = 0; i < suspect.length; ++i) {
            this.currentPath.push(i);
            const mismatch = this.validate(getSchema(i), suspect[i]);
            this.currentPath.pop();
            if (mismatch != null) {
                return mismatch;
            }
        }
        return null;
    }

    private validateSet(suspect: unknown, schema: SchemaSet) {
        for (const possibleSchema of schema) {
            if (this.validate(possibleSchema, suspect) == null) {
                return null;
            }
        }
        return this.makeTypeMismatch(suspect, schema);
    }

    private validateObject(suspect: I.Obj, schema: SchemaObj) {
        for (const propName of Object.getOwnPropertyNames(schema)) {
            this.currentPath.push(propName);
            const mismatch = this.validate(schema[propName], suspect[propName]);
            this.currentPath.pop();
            if (mismatch != null) {
                return mismatch;
            }
        }
        return null;
    }

    private validateObjectWithNoExcessProps(suspect: I.Obj, schema: SchemaObj) {
        const suspectProps = Object.getOwnPropertyNames(suspect);
        const schemaProps  = Object.getOwnPropertyNames(schema);

        // some props may be optional, that's my no === sign here
        if (schemaProps.length < suspectProps.length) {
            return this.makeTypeMismatch(suspect, schema);
        }
        
        let excessProps = suspectProps.length;
        for (const propName of schemaProps) {
            this.currentPath.push(propName);
            const mismatch = this.validate(schema[propName], suspect[propName]);
            this.currentPath.pop();
            if (mismatch != null) {
                return mismatch;
            }
            excessProps -= Number(propName in suspect);
        }
        return excessProps === 0 ? null : this.makeTypeMismatch(suspect, schema);
    }

    validate(schema: Schema, suspect: unknown): null | TypeMismatch {
        if (typeof schema === 'string') {
            return typeof suspect === schema 
                ? null 
                : this.makeTypeMismatch(suspect, schema);
        }
        if (typeof schema === 'function') {
            return schema(suspect) 
                ? null 
                : this.makeTypeMismatch(suspect, schema);
        }
        if (schema instanceof RegExp) {
            return typeof suspect === 'string' && schema.test(suspect) 
                ? null 
                : this.makeTypeMismatch(suspect, schema);
        }
        if (Array.isArray(schema)) {
            if (!Array.isArray(suspect)) {
                return this.makeTypeMismatch(suspect, schema);
            }
            if (schema.length === 0) {
                return null;
            }
            if (schema.length === 1) {
                return this.validateArray(suspect, () => schema[0]);
            }
            return schema.length !== suspect.length 
                ? this.makeTypeMismatch(suspect, schema) 
                : this.validateArray(suspect, i => schema[i]);
        }
        if (schema instanceof Set) {
            return this.validateSet(suspect, schema);
        }
        if (!isPlainObject(suspect) || Array.isArray(suspect)) {
            return this.makeTypeMismatch(suspect, schema);
        }
        return this.validateObject(suspect, schema);
    }
}