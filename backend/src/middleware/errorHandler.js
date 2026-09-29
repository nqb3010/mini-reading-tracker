'use strict'

const { AppError } = require('../lib/errors')

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    })
  }

  const status = err.status ?? err.statusCode ?? 500
  const message = status >= 500 ? 'Internal server error.' : err.message
  const code = err.code ?? 'INTERNAL_ERROR'
  console.error('[error]', err)
  res.status(status).json({ error: { code, message, details: [] } })
}

module.exports = { errorHandler }
