'use strict'

function sortShelfBooks(rows, sort) {
  const copy = [...rows]
  switch (sort) {
    case 'title':
      return copy.sort((a, b) =>
        a.title.localeCompare(b.title, 'vi', { sensitivity: 'base' }),
      )
    case 'progress': {
      return copy.sort((a, b) => {
        const pa = a.totalPages ? a.currentPage / a.totalPages : 0
        const pb = b.totalPages ? b.currentPage / b.totalPages : 0
        return pb - pa || new Date(b.addedAt) - new Date(a.addedAt)
      })
    }
    case 'rating':
      return copy.sort((a, b) => {
        const ra = a.rating ?? -1
        const rb = b.rating ?? -1
        return rb - ra || new Date(b.addedAt) - new Date(a.addedAt)
      })
    case 'recent':
    default:
      return copy.sort(
        (a, b) => new Date(b.addedAt) - new Date(a.addedAt) || b.id - a.id,
      )
  }
}

module.exports = { sortShelfBooks }
