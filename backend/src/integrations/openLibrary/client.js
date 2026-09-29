'use strict'

const { AppError, appError } = require('../../lib/errors')
const { parseWorkKey, SEARCH_FIELDS } = require('./mapper')

const PAGE_SIZE = 20
const MAX_WORK_REDIRECTS = 3

function isTimeoutError(error) {
  return error?.name === 'TimeoutError'
}

function transportError(error) {
  if (error instanceof AppError) return error
  if (isTimeoutError(error)) return appError('UPSTREAM_TIMEOUT', { cause: error })
  return appError('UPSTREAM_UNAVAILABLE', { cause: error })
}

function statusError(status, pathname) {
  const cause = new Error(`Open Library returned HTTP ${status} for ${pathname}`)
  if (status === 429 || status === 503) return appError('UPSTREAM_RATE_LIMITED', { cause })
  return appError('UPSTREAM_UNAVAILABLE', { cause })
}

function trimTrailingSlash(url) {
  return url.replace(/\/+$/, '')
}

function createOpenLibraryClient({ baseUrl, coversUrl, timeoutMs, userAgent }) {
  baseUrl = trimTrailingSlash(baseUrl)
  coversUrl = trimTrailingSlash(coversUrl)

  async function send(url, accept, signal) {
    const timeout = AbortSignal.timeout(timeoutMs)
    try {
      return await fetch(url.toString(), {
        headers: { 'User-Agent': userAgent, Accept: accept },
        signal: signal ? AbortSignal.any([timeout, signal]) : timeout,
      })
    } catch (error) {
      throw transportError(error)
    }
  }

  function discard(response) {
    response.body?.cancel().catch(() => {})
  }

  async function readJson(response) {
    try {
      return await response.json()
    } catch (error) {
      throw transportError(error)
    }
  }

  async function getJson(url) {
    const response = await send(url, 'application/json')
    if (!response.ok) {
      discard(response)
      throw statusError(response.status, new URL(url).pathname)
    }
    return readJson(response)
  }

  function buildSearchUrl(params) {
    const url = new URL(`${baseUrl}/search.json`)
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
    url.searchParams.set('fields', SEARCH_FIELDS.join(','))
    return url.toString()
  }

  async function runSearch(url) {
    const data = await getJson(url)
    if (typeof data?.numFound !== 'number' || !Array.isArray(data?.docs)) {
      throw appError('UPSTREAM_UNAVAILABLE', {
        cause: new Error('Malformed search.json response'),
      })
    }
    return { numFound: data.numFound, docs: data.docs }
  }

  async function fetchWork(workId) {
    const url = `${baseUrl}/works/${workId}.json`
    const response = await send(url, 'application/json')
    if (response.status === 404) {
      discard(response)
      throw appError('BOOK_NOT_FOUND')
    }
    if (!response.ok) {
      discard(response)
      throw statusError(response.status, `/works/${workId}.json`)
    }
    const data = await readJson(response)
    if (!data?.key) {
      throw appError('UPSTREAM_UNAVAILABLE', {
        cause: new Error(`Malformed /works/${workId}.json response`),
      })
    }
    return data
  }

  return {
    search({ q, page, sort }) {
      const params = { q, page: String(page), limit: String(PAGE_SIZE) }
      if (sort) params.sort = sort
      return runSearch(buildSearchUrl(params))
    },

    async searchByWorkKey(workId) {
      const result = await runSearch(buildSearchUrl({ q: `key:"/works/${workId}"`, limit: '1' }))
      return result.docs.find((doc) => doc.key === `/works/${workId}`) ?? null
    },

    async getWork(workId) {
      let currentId = workId
      for (let hop = 0; hop <= MAX_WORK_REDIRECTS; hop++) {
        const work = await fetchWork(currentId)
        const type = work.type?.key
        if (type === '/type/delete') throw appError('BOOK_NOT_FOUND')
        if (type !== '/type/redirect') {
          return { canonicalId: parseWorkKey(work.key) ?? currentId, work }
        }
        const next = parseWorkKey(work.location)
        if (!next) throw appError('BOOK_NOT_FOUND')
        currentId = next
      }
      throw appError('BOOK_NOT_FOUND', {
        cause: new Error(`${workId} redirects more than ${MAX_WORK_REDIRECTS} times`),
      })
    },

    async fetchCover(coverId, size, signal) {
      const url = `${coversUrl}/b/id/${coverId}-${size}.jpg?default=false`
      const response = await send(url, 'image/*', signal)
      if (response.status === 404) {
        discard(response)
        return null
      }
      if (!response.ok) {
        discard(response)
        throw statusError(response.status, `/b/id/${coverId}-${size}.jpg`)
      }
      const contentType = response.headers.get('content-type') ?? 'image/jpeg'
      if (!contentType.toLowerCase().startsWith('image/') || !response.body) {
        discard(response)
        throw appError('UPSTREAM_UNAVAILABLE', {
          cause: new Error(`Cover ${coverId} has Content-Type ${contentType}`),
        })
      }
      return {
        contentType,
        contentLength: response.headers.get('content-length'),
        body: response.body,
      }
    },
  }
}

module.exports = { createOpenLibraryClient }
