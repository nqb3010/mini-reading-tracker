'use strict'

const { searchResultToDto, bookDetailToDto } = require('../views')

function createBooksController({ booksService }) {
  return {
    async search(req, res, next) {
      try {
        const q = String(req.query.q ?? '').trim().slice(0, 200)
        const page = Math.max(1, Math.min(1000, parseInt(req.query.page, 10) || 1))
        if (!q) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Query q is required.' } })
        const result = await booksService.search(q, page)
        res.json({ data: searchResultToDto(result) })
      } catch (err) { next(err) }
    },

    async suggestions(req, res, next) {
      try {
        const page = Math.max(1, Math.min(1000, parseInt(req.query.page, 10) || 1))
        const result = await booksService.suggestions(page)
        res.json({ data: searchResultToDto(result) })
      } catch (err) { next(err) }
    },

    async detail(req, res, next) {
      try {
        const workId = req.params.workId
        if (!/^OL[1-9][0-9]*W$/.test(workId)) {
          return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid workId.' } })
        }
        const { book, shelfRow } = await booksService.getBookDetail(workId)
        res.json({ data: bookDetailToDto(book, shelfRow) })
      } catch (err) { next(err) }
    },
  }
}

module.exports = { createBooksController }
