'use strict'

const { fromDbDate } = require('../lib/dates')

const PAGE_SIZE = 20

function shelfBookToDto(row) {
  const currentPage = row.currentPage ?? 0
  const totalPages = row.totalPages ?? null
  const progressPercent =
    totalPages && totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : null
  return {
    id: row.id,
    workId: row.workId,
    title: row.title,
    authors: row.authors,
    coverId: row.coverId ?? null,
    firstPublishYear: row.firstPublishYear ?? null,
    totalPages,
    status: row.status,
    currentPage,
    progressPercent,
    rating: row.rating ?? null,
    note: row.note ?? null,
    startedAt: row.startedAt ? fromDbDate(new Date(row.startedAt)) : null,
    finishedAt: row.finishedAt ? fromDbDate(new Date(row.finishedAt)) : null,
    addedAt: row.addedAt,
    updatedAt: row.updatedAt,
  }
}

function bookSummaryToDto(snapshot, shelfStatuses) {
  const shelfStatus = shelfStatuses.get(snapshot.workId)
  return {
    workId: snapshot.workId,
    title: snapshot.title,
    authors: snapshot.authors,
    firstPublishYear: snapshot.firstPublishYear ?? null,
    coverId: snapshot.coverId ?? null,
    totalPages: snapshot.totalPages ?? null,
    inShelf: shelfStatus !== undefined,
    shelfStatus: shelfStatus ?? null,
  }
}

function bookDetailToDto(book, shelfRow) {
  return {
    workId: book.workId,
    title: book.title,
    authors: book.authors,
    firstPublishYear: book.firstPublishYear ?? null,
    coverId: book.coverId ?? null,
    totalPages: book.totalPages ?? null,
    description: book.description ?? null,
    subjects: book.subjects,
    shelfEntry: shelfRow ? shelfBookToDto(shelfRow) : null,
  }
}

function searchResultToDto(page) {
  return {
    query: page.query,
    page: page.page,
    pageSize: PAGE_SIZE,
    total: page.total,
    totalPages: page.totalPages,
    items: page.books.map((b) => bookSummaryToDto(b, page.shelfStatuses)),
  }
}

module.exports = { shelfBookToDto, bookDetailToDto, searchResultToDto }
