'use strict'

const WORK_KEY = /^\/works\/(OL[1-9][0-9]*W)$/
const TITLE_MAX_LENGTH = 500
const UNSIGNED_INT_MAX = 4_294_967_295
const SMALLINT_MIN = -32_768
const SMALLINT_MAX = 32_767

const { normalizeText, collapseWhitespace, markdownToPlainText } = require('../../lib/text')

const UNTITLED = '(Không có tên)'
const MAX_SUBJECTS = 30
const SEARCH_FIELDS = [
  'key', 'title', 'author_name', 'first_publish_year',
  'cover_i', 'number_of_pages_median',
]

function parseWorkKey(key) {
  if (!key) return null
  const m = WORK_KEY.exec(key)
  return m ? m[1] : null
}

function cleanText(value) {
  return normalizeText(collapseWhitespace(value))
}

function truncate(value, max) {
  const chars = Array.from(value)
  return chars.length > max ? chars.slice(0, max).join('') : value
}

function intInRange(value, min, max) {
  return value !== undefined && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null
}

function toTitle(title) {
  const cleaned = title ? cleanText(title) : ''
  return cleaned ? truncate(cleaned, TITLE_MAX_LENGTH) : UNTITLED
}

function toAuthors(names) {
  const authors = []
  for (const name of names ?? []) {
    const cleaned = cleanText(name)
    if (cleaned && !authors.includes(cleaned)) authors.push(cleaned)
  }
  return authors
}

function toCoverId(coverId) {
  return intInRange(coverId, 1, UNSIGNED_INT_MAX)
}

function toBookSummary(doc) {
  const workId = parseWorkKey(doc.key)
  if (!workId) return null
  return {
    workId,
    title: toTitle(doc.title),
    authors: toAuthors(doc.author_name),
    firstPublishYear: intInRange(doc.first_publish_year, SMALLINT_MIN, SMALLINT_MAX),
    coverId: toCoverId(doc.cover_i),
    totalPages: intInRange(doc.number_of_pages_median, 1, UNSIGNED_INT_MAX),
  }
}

function toDescription(description) {
  const raw = typeof description === 'string' ? description : description?.value
  if (!raw) return null
  return normalizeText(markdownToPlainText(raw)) || null
}

function toSubjects(subjects) {
  const result = []
  const seen = new Set()
  for (const subject of subjects ?? []) {
    if (typeof subject !== 'string') continue
    const cleaned = cleanText(subject)
    const key = cleaned.toLocaleLowerCase('vi')
    if (!cleaned || seen.has(key)) continue
    seen.add(key)
    result.push(cleaned)
    if (result.length === MAX_SUBJECTS) break
  }
  return result
}

function toBookDetail(work, doc, canonicalId) {
  const fromSearch = doc ? toBookSummary(doc) : null
  const workCover = (work.covers ?? []).find((c) => typeof c === 'number' && c > 0)
  return {
    workId: canonicalId,
    title: work.title?.trim() ? toTitle(work.title) : toTitle(doc?.title),
    authors: fromSearch?.authors ?? [],
    firstPublishYear: fromSearch?.firstPublishYear ?? null,
    coverId: fromSearch?.coverId ?? toCoverId(workCover),
    totalPages: fromSearch?.totalPages ?? null,
    description: toDescription(work.description),
    subjects: toSubjects(work.subjects),
  }
}

module.exports = { parseWorkKey, toBookSummary, toBookDetail, toDescription, toSubjects, SEARCH_FIELDS }
