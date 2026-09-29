import { apiUrl, request } from './http'

export const MAX_SEARCH_PAGE = 1000

export async function searchBooks(q, page, signal) {
  const envelope = await request('/api/books/search', { query: { q, page }, signal })
  return envelope.data
}

export async function getBookDetail(workId, signal) {
  const envelope = await request(`/api/books/${encodeURIComponent(workId)}`, { signal })
  return envelope.data
}

export function coverUrl(coverId, size) {
  return apiUrl(`/api/covers/${coverId}`, { size })
}
