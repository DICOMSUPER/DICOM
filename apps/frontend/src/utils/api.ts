/**
 * Extracts array data from various API response structures.
 * Handles:
 * - Direct arrays: [item1, item2, ...]
 * - Wrapped responses: { data: [item1, item2, ...] }
 * - Nested responses: { data: { data: [item1, item2, ...] } }
 * - Paginated responses: { data: [...], total: 10, page: 1, ... }
 * 
 * @param response - The API response (unknown type to handle any structure)
 * @returns An array of type T, or empty array if no data found
 * 
 * @example
 * // Direct array
 * const items = extractApiData<Item>([{ id: 1 }, { id: 2 }])
 * 
 * @example
 * // Wrapped response
 * const items = extractApiData<Item>({ data: [{ id: 1 }] })
 * 
 * @example
 * // Nested response (like bulk assignment)
 * const items = extractApiData<Item>({ data: { data: [{ id: 1 }], count: 1 } })
 * 
 * @example
 * // Paginated response
 * const items = extractApiData<Item>({ data: [{ id: 1 }], total: 1, page: 1 })
 */
export function extractApiData<T>(response: unknown): T[] {
  if (!response) return []

  if (Array.isArray(response)) {
    return response as T[]
  }

  if (typeof response === "object" && response !== null && "data" in response) {
    const dataField = (response as { data?: unknown }).data

    if (Array.isArray(dataField)) {
      return dataField as T[]
    }

    // Handle nested data structures (data.data, data.data.data, etc.)
    if (dataField && typeof dataField === "object") {
      const nestedData = dataField as { data?: unknown }
      
      // Check if nested data has a data field that is an array
      if ("data" in nestedData && Array.isArray(nestedData.data)) {
        return (nestedData.data || []) as T[]
      }
      
      // Handle triple nesting: data.data.data (e.g., { data: { data: { data: [...] } } })
      if ("data" in nestedData && nestedData.data && typeof nestedData.data === "object") {
        const deeperNested = nestedData.data as { data?: unknown }
        if ("data" in deeperNested && Array.isArray(deeperNested.data)) {
          return (deeperNested.data || []) as T[]
        }
      }
    }
  }

  return []
}
