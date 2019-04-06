import * as I from 'ts-typedefs';
import { Validator } from '../validator';
import { ObjectValidationStrategy } from '../interfaces/object-validation-strategy';
import { SchemaObj } from '../../types/schema';

/**
 * Validates an object to have **only** those properties that are present in its schema.
 */
export default new class implements ObjectValidationStrategy  {

    validateObject(validator: Validator, suspect: I.Obj, schema: SchemaObj) {
        const suspectProps = Object.getOwnPropertyNames(suspect);
        const schemaProps  = Object.getOwnPropertyNames(schema);

        // some props may be optional, that's why no `===` comparison here
        if (schemaProps.length < suspectProps.length) {
            return validator.createTypeMismatch(suspect, schema);
        }
        
        let excessProps = suspectProps.length;
        for (const propName of schemaProps) {
            const mismatch = validator.validateProperty(
                propName, schema[propName], suspect[propName]
            );
            if (mismatch != null) {
                return mismatch;
            }
            excessProps -= Number(propName in suspect);
        }
        return excessProps === 0 ? null : validator.createTypeMismatch(suspect, schema);
    }

};

