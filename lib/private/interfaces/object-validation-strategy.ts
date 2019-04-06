import * as I from 'ts-typedefs';
import { Validator } from '../validator';
import { SchemaObj } from '../../types/schema';
import { TypeMismatch } from '../../type-mismatch';

export interface ObjectValidationStrategy {
    /**
     * Validates an object according to its custom logic (strategy)
     * 
     * @param validator Validator that uses this strategy.
     * @param suspect   Unknown object to validate.
     * @param schema    Validation schema object.
     * 
     * @remarks
     * The implementation must use only the given `validator` to perform validation and
     * create `TypeMismatch`es (via `validateProperty()` and `createTypeMismatch()` methods)
     * Because this object keeps track of property paths and generates appropriate
     * errors.
     */
    validateObject(
        validator: Validator, 
        suspect: I.Obj, 
        schema: SchemaObj
    ): null | TypeMismatch;
}