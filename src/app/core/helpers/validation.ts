export function validateFields(
    data: Record<string, unknown>,
    requiredFields: readonly string[]
): boolean {

    return !requiredFields.some(    
        field =>
            data[field] === null ||
            data[field] === undefined ||
            data[field] === ''
    );
}