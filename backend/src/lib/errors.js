'use strict'

class AppError extends Error {
  constructor(status, code, message, details = []) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const ERROR_MAP = {
  BOOK_NOT_FOUND:        { status: 404, message: 'Book not found on Open Library.' },
  BOOK_ALREADY_IN_SHELF: { status: 409, message: 'This book is already on your shelf.' },
  SHELF_BOOK_NOT_FOUND:  { status: 404, message: 'Book not found on your shelf.' },
  UPSTREAM_TIMEOUT:      { status: 504, message: 'Open Library did not respond in time.' },
  UPSTREAM_RATE_LIMITED: { status: 503, message: 'Open Library is temporarily unavailable.' },
  UPSTREAM_UNAVAILABLE:  { status: 502, message: 'Could not reach Open Library.' },
  VALIDATION_ERROR:      { status: 400, message: 'Validation failed.' },
}

function appError(code, opts = {}) {
  const def = ERROR_MAP[code] ?? { status: 500, message: 'Internal server error.' }
  return new AppError(def.status, code, opts.message ?? def.message, [])
}

function validationError(details) {
  const err = new AppError(400, 'VALIDATION_ERROR', 'Validation failed.', details)
  return err
}

module.exports = { AppError, appError, validationError }
