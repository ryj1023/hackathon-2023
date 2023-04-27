export const exists = <T>(x: T | null | undefined): x is T => x !== null && x !== undefined;
