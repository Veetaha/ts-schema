export function int(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && Number.isInteger(suspect);
}

export function positiveInt(suspect: unknown): suspect is number {
    return int(suspect) && suspect > 0;
}