'use strict'

const { Router } = require('express')

function createApiRouter({ health, books, covers, shelf }) {
  const router = Router()

  router.get('/health', (req, res, next) => health.check(req, res, next))

  router.get('/books/search', (req, res, next) => books.search(req, res, next))
  router.get('/books/suggestions', (req, res, next) => books.suggestions(req, res, next))
  router.get('/books/:workId', (req, res, next) => books.detail(req, res, next))

  router.get('/covers/:coverId', (req, res, next) => covers.proxy(req, res, next))

  router.post('/shelf', (req, res, next) => shelf.add(req, res, next))
  router.get('/shelf', (req, res, next) => shelf.list(req, res, next))
  router.patch('/shelf/:workId', (req, res, next) => shelf.update(req, res, next))
  router.delete('/shelf/:workId', (req, res, next) => shelf.remove(req, res, next))

  return router
}

module.exports = { createApiRouter }
