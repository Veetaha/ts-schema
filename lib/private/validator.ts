import * as I from 'ts-typedefs';
import { ValidationOptions, PathArray, Schema, SchemaSet } from '../types';

import noExcessProps from './validation-strategies/no-excess-props';
import excessProps   from './validation-strategies/excess-props';
import { TypeMismatch } from '../type-mismatch';
import { isPlainObject } from '../schemas';

/**
 * For internal use only.
 */
export class Validator {
    private readonly currentPath: PathArray = [];

    constructor(
        private readonly validationOpts: ValidationOptions
    ) {}

    private readonly objStrategy = this.validationOpts.noExcessProps 
        ? noExcessProps 
        : excessProps;

    createTypeMismatch(actualValue: unknown, expectedSchema: Schema) {
        return new TypeMismatch({ 
            actualValue, 
            expectedSchema, 
            path: [ ...this.currentPath ] 
        });
    }

    private validateArray(suspect: unknown[], getSchemaItem: (index: number) => Schema) {
        for (let i = 0; i < suspect.length; ++i) {
            const mismatch = this.validateProperty(i, getSchemaItem(i), suspect[i]);
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
        return this.createTypeMismatch(suspect, schema);
    }

    validateProperty(
        propName:        I.UnpackArray<PathArray>, 
        ...validateArgs: Parameters<Validator['validate']>
    ) {
        this.currentPath.push(propName);
        const result = this.validate(...validateArgs);
        this.currentPath.pop();
        return result;
    }

    validate(schema: Schema, suspect: unknown): null | TypeMismatch {
        if (typeof schema === 'string') {
            return typeof suspect === schema 
                ? null 
                : this.createTypeMismatch(suspect, schema);
        }
        if (typeof schema === 'function') {
            return schema(suspect, this.validationOpts) 
                ? null 
                : this.createTypeMismatch(suspect, schema);
        }
        if (schema instanceof RegExp) {
            return typeof suspect === 'string' && schema.test(suspect) 
                ? null 
                : this.createTypeMismatch(suspect, schema);
        }
        if (Array.isArray(schema)) {
            if (!Array.isArray(suspect)) {
                return this.createTypeMismatch(suspect, schema);
            }
            if (schema.length === 0) {
                return null;
            }
            if (schema.length === 1) {
                return this.validateArray(suspect, () => schema[0]);
            }
            return schema.length !== suspect.length 
                ? this.createTypeMismatch(suspect, schema) 
                : this.validateArray(suspect, i => schema[i]);
        }
        if (schema instanceof Set) {
            return this.validateSet(suspect, schema);
        }
        if (!isPlainObject(suspect) || Array.isArray(suspect)) {
            return this.createTypeMismatch(suspect, schema);
        }
        return this.objStrategy.validateObject(this, suspect, schema);
    }
}

