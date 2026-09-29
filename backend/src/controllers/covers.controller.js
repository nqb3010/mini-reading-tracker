'use strict'

function createCoversController({ openLibrary }) {
  return {
    async proxy(req, res, next) {
      try {
        const coverId = parseInt(req.params.coverId, 10)
        if (!Number.isFinite(coverId) || coverId < 1) {
          return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid coverId.' } })
        }
        const size = ['S', 'M', 'L'].includes(req.query.size) ? req.query.size : 'M'
        const signal = req.socket.destroyed ? AbortSignal.abort() : undefined
        const image = await openLibrary.fetchCover(coverId, size, signal)
        if (!image) return res.status(404).end()
        if (image.contentLength) res.setHeader('Content-Length', image.contentLength)
        res.setHeader('Content-Type', image.contentType)
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable')
        const { Readable } = require('stream')
        Readable.fromWeb(image.body).pipe(res)
      } catch (err) { next(err) }
    },
  }
}

module.exports = { createCoversController }
