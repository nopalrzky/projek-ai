import { QueryBuilderOptions } from "@/types/filters";

/**
 * Convert camelCase string to snake_case
 *
 * @param str - The camelCase string
 * @returns The snake_case string
 *
 * @example
 * ```ts
 * camelToSnake('firstName') // 'first_name'
 * camelToSnake('isActive') // 'is_active'
 * ```
 */
export function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case string to camelCase
 *
 * @param str - The snake_case string
 * @returns The camelCase string
 *
 * @example
 * ```ts
 * snakeToCamel('first_name') // 'firstName'
 * snakeToCamel('is_active') // 'isActive'
 * ```
 */
export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 *
 * @param value - The value to check
 * @returns True if value is empty
 */
function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
}

/**
 * Build query parameters object for Inertia requests
 * Removes empty/undefined/null values and optionally converts camelCase to snake_case
 *
 * @param params - The parameters object
 * @param options - Builder options
 * @returns Clean query parameters object
 *
 * @example
 * ```ts
 * const params = buildQueryParams({
 *   search: 'test',
 *   isActive: true,
 *   ownerId: undefined,
 *   emptyString: '',
 * }, { camelToSnake: true, removeEmpty: true });
 *
 * // Result: { search: 'test', is_active: true }
 * ```
 */
export function buildQueryParams<T extends Record<string, any>>(
    params: T,
    options: QueryBuilderOptions = {}
): Record<string, any> {
    const {
        camelToSnake: convertToSnake = false,
        removeEmpty = true,
        removeUndefined = true,
        removeNull = true,
    } = options;

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
        // Skip based on options
        if (removeUndefined && value === undefined) continue;
        if (removeNull && value === null) continue;
        if (removeEmpty && isEmpty(value)) continue;

        // Convert key if needed
        const finalKey = convertToSnake ? camelToSnake(key) : key;

        // Handle nested objects
        if (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        ) {
            const nested = buildQueryParams(value, options);
            if (Object.keys(nested).length > 0) {
                result[finalKey] = nested;
            }
        } else {
            result[finalKey] = value;
        }
    }

    return result;
}

/**
 * Build query string from object
 *
 * @param params - The parameters object
 * @param options - Builder options
 * @returns Query string (without leading '?')
 *
 * @example
 * ```ts
 * buildQueryString({ search: 'test', page: 1 })
 * // Returns: 'search=test&page=1'
 * ```
 */
export function buildQueryString<T extends Record<string, any>>(
    params: T,
    options: QueryBuilderOptions = {}
): string {
    const cleanParams = buildQueryParams(params, options);
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(cleanParams)) {
        if (Array.isArray(value)) {
            value.forEach((item) =>
                searchParams.append(`${key}[]`, String(item))
            );
        } else if (typeof value === "object" && value !== null) {
            // Flatten nested objects
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
                searchParams.append(
                    `${key}[${nestedKey}]`,
                    String(nestedValue)
                );
            }
        } else {
            searchParams.append(key, String(value));
        }
    }

    return searchParams.toString();
}

/**
 * Parse query string to object
 *
 * @param queryString - The query string (with or without leading '?')
 * @param options - Parser options
 * @returns Parsed object
 *
 * @example
 * ```ts
 * parseQueryString('search=test&page=1&is_active=true')
 * // Returns: { search: 'test', page: 1, isActive: true }
 * ```
 */
export function parseQueryString(
    queryString: string,
    options: { snakeToCamel?: boolean } = {}
): Record<string, any> {
    const { snakeToCamel: convertToCamel = false } = options;

    const params = new URLSearchParams(queryString.replace(/^\?/, ""));
    const result: Record<string, any> = {};

    for (const [key, value] of params.entries()) {
        const finalKey = convertToCamel ? snakeToCamel(key) : key;

        // Try to parse as number
        if (!isNaN(Number(value)) && value.trim() !== "") {
            result[finalKey] = Number(value);
        }
        // Parse boolean
        else if (value === "true" || value === "false") {
            result[finalKey] = value === "true";
        }
        // Keep as string
        else {
            result[finalKey] = value;
        }
    }

    return result;
}

/**
 * Merge multiple query parameter objects
 * Later objects override earlier ones
 *
 * @param params - Array of parameter objects
 * @returns Merged parameters
 *
 * @example
 * ```ts
 * mergeQueryParams(
 *   { search: 'old', page: 1 },
 *   { search: 'new', perPage: 15 }
 * )
 * // Returns: { search: 'new', page: 1, perPage: 15 }
 * ```
 */
export function mergeQueryParams<T extends Record<string, any>>(
    ...params: Partial<T>[]
): T {
    return Object.assign({}, ...params) as T;
}

/**
 * Get current URL query parameters as object
 *
 * @param options - Parser options
 * @returns Current query parameters
 *
 * @example
 * ```ts
 * // URL: /outlets?search=test&page=1
 * getCurrentQueryParams()
 * // Returns: { search: 'test', page: 1 }
 * ```
 */
export function getCurrentQueryParams(
    options: { snakeToCamel?: boolean } = {}
): Record<string, any> {
    if (typeof window === "undefined") return {};
    return parseQueryString(window.location.search, options);
}
