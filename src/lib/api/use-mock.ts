export function withMock<T>(mockData: T, apiFn: () => Promise<T>): Promise<T> {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    return Promise.resolve(mockData)
  }
  return apiFn()
}
