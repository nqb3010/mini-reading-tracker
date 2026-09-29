'use strict'

const { shelfBookToDto } = require('../views')

const VALID_STATUSES = ['want_to_read', 'reading', 'read']
const VALID_SORTS = ['recent', 'title', 'progress', 'rating']

function createShelfController({ shelfService }) {
  return {
    async add(req, res, next) {
      try {
        const { workId, status = 'want_to_read' } = req.body ?? {}
        if (!workId || typeof workId !== 'string' || !/^OL[1-9][0-9]*W$/.test(workId)) {
          return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid workId.' } })
        }
        if (!VALID_STATUSES.includes(status)) {
          return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid status.' } })
        }
        const row = await shelfService.addToShelf(workId, status)
        res.status(201).json({ data: shelfBookToDto(row) })
      } catch (err) { next(err) }
    },

    async list(req, res, next) {
      try {
        const status = VALID_STATUSES.includes(req.query.status) ? req.query.status : undefined
        const sort = VALID_SORTS.includes(req.query.sort) ? req.query.sort : 'recent'
        const { rows, counts } = await shelfService.listShelf(status, sort)
        res.json({ data: { items: rows.map(shelfBookToDto), counts } })
      } catch (err) { next(err) }
    },

    async update(req, res, next) {
      try {
        const { workId } = req.params
        if (!/^OL[1-9][0-9]*W$/.test(workId)) {
          return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid workId.' } })
        }
        const patch = {}
        const body = req.body ?? {}
        if (body.status !== undefined) {
          if (!VALID_STATUSES.includes(body.status)) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid status.' } })
          }
          patch.status = body.status
        }
        if (body.currentPage !== undefined) patch.currentPage = body.currentPage
        if (body.rating !== undefined) patch.rating = body.rating
        if (body.note !== undefined) patch.note = body.note
        const { row, autoFinished } = await shelfService.updateShelfBook(workId, patch)
        res.json({ data: shelfBookToDto(row), meta: { autoFinished } })
      } catch (err) { next(err) }
    },

    async remove(req, res, next) {
      try {
        const { workId } = req.params
        if (!/^OL[1-9][0-9]*W$/.test(workId)) {
          return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid workId.' } })
        }
        await shelfService.removeFromShelf(workId)
        res.status(204).end()
      } catch (err) { next(err) }
    },
  }
}

module.exports = { createShelfController }
