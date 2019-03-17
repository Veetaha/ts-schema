import { TypeMismatch, Schema, validate } from './index';

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

/**
 * This function returns nothing. It throws `TypeMismatchError` if its `suspect`
 * failed to match to the given `schema` by executing `validate()`.
 */
export function validateOrThrow(...args: Parameters<typeof validate>) {
    const mismatch = validate(...args);
    if (mismatch != null) {
        throw new TypeMismatchError(mismatch);
    }
}