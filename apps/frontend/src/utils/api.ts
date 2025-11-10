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
