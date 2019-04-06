import { TypeMismatch, Schema } from './index';

/**
 * Represents an error risen by type mismatch inconsistency.
 * Stores `TypeMismatch` that rose this error.
 */
export class TypeMismatchError<TSchema extends Schema = Schema> extends Error {
    /**
     * Contains information about occured type mismatch.
     */
    typeMismatch: TypeMismatch<TSchema>;
    /**
     * Instantiates TypeMismatchError with the given `TypeMismatch` data.
     * @param typeMismatch `TypeMismatch` that describes an errored type.
     */
    constructor(typeMismatch: TypeMismatch<TSchema>) { 
        super(typeMismatch.toErrorString());
        this.typeMismatch = typeMismatch;
    }
}
