/**
 * Utility functions to ensure safe array operations and prevent "filter is not a function" errors
 */

/**
 * Ensures the input is always an array, preventing filter/map/reduce errors
 */
export function ensureArray<T>(input: any): T[] {
  if (Array.isArray(input)) {
    return input;
  }

  // If it's an object with array property, try to extract it
  if (input && typeof input === "object") {
    // Try common array property names
    const arrayProperties = ["data", "items", "results", "list", "array"];
    for (const prop of arrayProperties) {
      if (Array.isArray(input[prop])) {
        return input[prop];
      }
    }
  }

  // Return empty array as fallback
  return [];
}

/**
 * Safely filter an array, ensuring it's always an array first
 */
export function safeFilter<T>(
  input: any,
  predicate: (item: T) => boolean,
): T[] {
  return ensureArray<T>(input).filter(predicate);
}

/**
 * Safely map an array, ensuring it's always an array first
 */
export function safeMap<T, U>(input: any, mapper: (item: T) => U): U[] {
  return ensureArray<T>(input).map(mapper);
}

/**
 * Safely get array length, returning 0 if not an array
 */
export function safeLength(input: any): number {
  return ensureArray(input).length;
}

/**
 * Safely slice an array, ensuring it's always an array first
 */
export function safeSlice<T>(input: any, start?: number, end?: number): T[] {
  return ensureArray<T>(input).slice(start, end);
}
