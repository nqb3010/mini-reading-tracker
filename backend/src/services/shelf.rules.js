'use strict'

const { validationError } = require('../lib/errors')
const { normalizeText } = require('../lib/text')

const NOTE_MAX_LENGTH = 500

const RULE_MESSAGES = {
  pageNotInteger: 'The page number must be an integer.',
  pageNegative: 'The page number must be greater than or equal to 0.',
  pageOverTotal: (totalPages) => `Must not exceed ${totalPages} pages.`,
  pageWithoutTotal: 'This book has no total page count, so its current page cannot be updated.',
  ratingOutOfRange: 'The rating must be an integer from 1 to 5.',
  noteTooLong: `The note must be at most ${NOTE_MAX_LENGTH} characters.`,
}

function fail(field, message) {
  throw validationError([{ field, message }])
}

function transition(state, to, today) {
  const from = state.status
  if (from === to) return
  state.status = to
  if (from === 'read') state.finishedAt = null
  if (to === 'reading') {
    if (!state.startedAt) state.startedAt = today
  }
  if (to === 'read') {
    state.finishedAt = today
    if (!state.startedAt) state.startedAt = today
    if (state.totalPages !== null) state.currentPage = state.totalPages
  }
}

function checkCurrentPage(currentPage, totalPages) {
  if (!Number.isInteger(currentPage)) fail('currentPage', RULE_MESSAGES.pageNotInteger)
  if (currentPage < 0) fail('currentPage', RULE_MESSAGES.pageNegative)
  if (totalPages === null) fail('currentPage', RULE_MESSAGES.pageWithoutTotal)
  if (currentPage > totalPages) fail('currentPage', RULE_MESSAGES.pageOverTotal(totalPages))
  return totalPages
}

function checkRating(rating) {
  if (rating === null) return null
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    fail('rating', RULE_MESSAGES.ratingOutOfRange)
  }
  return rating
}

function normalizeNote(note) {
  if (note === null) return null
  const value = normalizeText(note).trim()
  if (value === '') return null
  if (value.length > NOTE_MAX_LENGTH) fail('note', RULE_MESSAGES.noteTooLong)
  return value
}

function buildNewEntry(snapshot, status, today) {
  const totalPages =
    snapshot.totalPages !== null && snapshot.totalPages > 0 ? snapshot.totalPages : null
  const entry = {
    ...snapshot,
    totalPages,
    status: 'want_to_read',
    currentPage: 0,
    rating: null,
    note: null,
    startedAt: null,
    finishedAt: null,
  }
  transition(entry, status, today)
  return entry
}

function applyShelfUpdate(current, patch, today) {
  const next = { ...current }
  let autoFinished = false

  if (patch.currentPage !== undefined) {
    const totalPages = checkCurrentPage(patch.currentPage, current.totalPages)
    next.currentPage = patch.currentPage
    if (next.currentPage === totalPages && next.status !== 'read') {
      transition(next, 'read', today)
      autoFinished = true
    } else if (next.currentPage < totalPages && next.status === 'read') {
      transition(next, 'reading', today)
    }
  }

  if (patch.status !== undefined) {
    transition(next, patch.status, today)
    autoFinished = false
  }

  if (patch.rating !== undefined) next.rating = checkRating(patch.rating)
  if (patch.note !== undefined) next.note = normalizeNote(patch.note)

  return { next, autoFinished }
}

module.exports = { buildNewEntry, applyShelfUpdate, NOTE_MAX_LENGTH }
