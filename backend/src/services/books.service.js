'use strict'

const { createTtlCache } = require('../lib/cache')
const { toBookSummary, toBookDetail } = require('../integrations/openLibrary/mapper')

const PAGE_SIZE = 20
const SEARCH_CACHE    = { max: 300, ttlMs: 10 * 60 * 1000 }
const SNAPSHOT_CACHE  = { max: 500, ttlMs: 24 * 60 * 60 * 1000 }
const DETAIL_CACHE    = { max: 500, ttlMs: 24 * 60 * 60 * 1000 }
const SUGGESTION_SORT = 'editions'

function createBooksService({ openLibrary, shelfBookModel, config }) {
  const searchCache   = createTtlCache(SEARCH_CACHE)
  const snapshotCache = createTtlCache(SNAPSHOT_CACHE)
  const detailCache   = createTtlCache(DETAIL_CACHE)

  async function searchPage(query, q, page, sort) {
    const key = JSON.stringify([q, page, sort ?? null])
    const { total, books } = await searchCache.getOrLoad(key, async () => {
      const response = await openLibrary.search({ q, page, sort })
      const mapped = response.docs.map(toBookSummary).filter(Boolean)
      for (const book of mapped) snapshotCache.set(book.workId, book)
      return { total: response.numFound, books: mapped }
    })
    const shelfStatuses = await shelfBookModel.findStatusesByWorkIds(books.map((b) => b.workId))
    return { query, page, total, totalPages: Math.ceil(total / PAGE_SIZE), books, shelfStatuses }
  }

  async function loadSnapshot(workId) {
    const doc = await openLibrary.searchByWorkKey(workId)
    const direct = doc ? toBookSummary(doc) : null
    if (direct) return direct

    const { canonicalId, work } = await openLibrary.getWork(workId)
    if (canonicalId !== workId) {
      const canonicalDoc = await openLibrary.searchByWorkKey(canonicalId)
      const canonical = canonicalDoc ? toBookSummary(canonicalDoc) : null
      if (canonical) return canonical
    }
    const fallback = toBookSummary({ key: `/works/${canonicalId}`, title: work.title, cover_i: undefined })
    if (!fallback) throw new Error(`Could not build a snapshot for ${canonicalId}`)
    return fallback
  }

  async function loadDetail(workId) {
    const [{ canonicalId, work }, doc] = await Promise.all([
      openLibrary.getWork(workId),
      openLibrary.searchByWorkKey(workId),
    ])
    const finalDoc = canonicalId === workId ? doc : await openLibrary.searchByWorkKey(canonicalId)
    const detail = toBookDetail(work, finalDoc, canonicalId)
    const { description: _d, subjects: _s, ...snapshot } = detail
    snapshotCache.set(workId, snapshot)
    snapshotCache.set(canonicalId, snapshot)
    if (canonicalId !== workId) detailCache.set(canonicalId, detail)
    return detail
  }

  return {
    search(q, page) {
      return searchPage(q, q, page, undefined)
    },

    suggestions(page) {
      return searchPage(null, config.SUGGESTION_QUERY, page, SUGGESTION_SORT)
    },

    getBookSnapshot(workId) {
      return snapshotCache.getOrLoad(workId, () => loadSnapshot(workId))
    },

    async getBookDetail(workId) {
      const book = await detailCache.getOrLoad(workId, () => loadDetail(workId))
      const shelfRow = await shelfBookModel.findByWorkId(book.workId)
      return { book, shelfRow }
    },
  }
}

module.exports = { createBooksService }
