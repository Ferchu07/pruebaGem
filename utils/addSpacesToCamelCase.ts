export function addSpacesToCamelCase(str: string) {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2');
};

export const capitalize = (str: string) => {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};