import { request } from './http'

export const SHELF_SORTS = ['recent', 'title', 'progress', 'rating']

export async function addToShelf(workId, status) {
  const envelope = await request('/api/shelf', { method: 'POST', body: { workId, status } })
  return envelope.data
}

export async function listShelf(status, sort, signal) {
  const envelope = await request('/api/shelf', { query: { status, sort }, signal })
  return envelope.data
}

export async function updateShelfBook(workId, patch) {
  const envelope = await request(`/api/shelf/${encodeURIComponent(workId)}`, {
    method: 'PATCH',
    body: patch,
  })
  return { book: envelope.data, autoFinished: envelope.meta.autoFinished }
}

export async function removeFromShelf(workId) {
  await request(`/api/shelf/${encodeURIComponent(workId)}`, { method: 'DELETE' })
}
