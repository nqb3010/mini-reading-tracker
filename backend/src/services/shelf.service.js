'use strict'

const { appError } = require('../lib/errors')
const { todayInTimezone } = require('../lib/dates')
const { buildNewEntry, applyShelfUpdate } = require('./shelf.rules')
const { sortShelfBooks } = require('./shelf.sort')

function createShelfService({ shelfBookModel, booksService, config, now }) {
  const today = () => todayInTimezone(config.APP_TIMEZONE, now())

  return {
    async addToShelf(workId, status) {
      if (await shelfBookModel.findByWorkId(workId)) throw appError('BOOK_ALREADY_IN_SHELF')

      const snapshot = await booksService.getBookSnapshot(workId)
      if (snapshot.workId !== workId && (await shelfBookModel.findByWorkId(snapshot.workId))) {
        throw appError('BOOK_ALREADY_IN_SHELF')
      }
      return shelfBookModel.create(buildNewEntry(snapshot, status, today()))
    },

    async listShelf(status, sort) {
      const [rows, counts] = await Promise.all([
        shelfBookModel.list(status),
        shelfBookModel.countByStatus(),
      ])
      return { rows: sortShelfBooks(rows, sort), counts }
    },

    async updateShelfBook(workId, patch) {
      const date = today()
      let autoFinished = false
      const row = await shelfBookModel.updateReadingState(workId, (current) => {
        const result = applyShelfUpdate(current, patch, date)
        autoFinished = result.autoFinished
        return result.next
      })
      if (!row) throw appError('SHELF_BOOK_NOT_FOUND')
      return { row, autoFinished }
    },

    async removeFromShelf(workId) {
      if (!(await shelfBookModel.remove(workId))) throw appError('SHELF_BOOK_NOT_FOUND')
    },
  }
}

module.exports = { createShelfService }
