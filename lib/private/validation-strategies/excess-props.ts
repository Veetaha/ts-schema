import * as I from 'ts-typedefs';
import { ObjectValidationStrategy } from "../interfaces/object-validation-strategy";
import { Validator } from "../validator";
import { SchemaObj } from "../../types";

export default new class implements ObjectValidationStrategy {

    validateObject(validator: Validator, suspect: I.Obj, schema: SchemaObj) {
        for (const propName of Object.getOwnPropertyNames(schema)) {        
            const mismatch = validator.validateProperty(
                propName, schema[propName], suspect[propName]
            );
            if (mismatch != null) {
                return mismatch;
            }
        }
        return null;
    }

};