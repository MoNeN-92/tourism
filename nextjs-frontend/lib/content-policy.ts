const isProduction = process.env.NODE_ENV === 'production'

export function allowMockContent(): boolean {
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK_CONTENT === 'true') {
    return true
  }

  return !isProduction
}

export function mergeMockWithApiContent(): boolean {
  if (process.env.NEXT_PUBLIC_MERGE_MOCK_WITH_API === 'true') {
    return true
  }

  return !isProduction
}
