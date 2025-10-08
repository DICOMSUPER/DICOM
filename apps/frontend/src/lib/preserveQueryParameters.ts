function preserve(query : any, current : URLSearchParams, key : string) {
  const value = current.get(key);
  if (value) {
    query.append(key, value);
  }
}

export const preserveKeys = ['configUrl', 'multimonitor', 'screenNumber', 'hangingProtocolId'];

export function preserveQueryParameters(
  query : URLSearchParams,
  current = new URLSearchParams(window.location.search)
) {
  for (const key of preserveKeys) {
    preserve(query, current, key);
  }
}

export function preserveQueryStrings(query : any, current = new URLSearchParams(window.location.search)) {
  for (const key of preserveKeys) {
    const value = current.get(key);
    if (value) {
      query[key] = value;
    }
  }
}
