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

    if (
      dataField &&
      typeof dataField === "object" &&
      "data" in (dataField as { data?: unknown }) &&
      Array.isArray((dataField as { data?: unknown }).data)
    ) {
      return ((dataField as { data?: unknown }).data || []) as T[]
    }
  }

  return []
}
