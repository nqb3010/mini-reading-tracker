'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')
const { fromDbDate } = require('../lib/dates')

const ShelfBook = sequelize.define(
  'ShelfBook',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    workId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'work_id',
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    authors: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    coverId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'cover_id',
    },
    firstPublishYear: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'first_publish_year',
    },
    totalPages: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'total_pages',
    },
    status: {
      type: DataTypes.ENUM('want_to_read', 'reading', 'read'),
      allowNull: false,
      defaultValue: 'want_to_read',
    },
    currentPage: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'current_page',
    },
    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'started_at',
    },
    finishedAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'finished_at',
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'added_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    tableName: 'shelf_books',
    timestamps: true,
    createdAt: 'addedAt',
    updatedAt: 'updatedAt',
    indexes: [{ fields: ['status', 'added_at'], name: 'ix_shelf_books_status_added' }],
  },
)

function toReadingState(row) {
  return {
    status: row.status,
    currentPage: row.currentPage,
    totalPages: row.totalPages,
    rating: row.rating,
    note: row.note,
    startedAt: row.startedAt ? fromDbDate(new Date(row.startedAt)) : null,
    finishedAt: row.finishedAt ? fromDbDate(new Date(row.finishedAt)) : null,
  }
}

function readingStateData(state) {
  return {
    status: state.status,
    currentPage: state.currentPage,
    rating: state.rating,
    note: state.note,
    startedAt: state.startedAt ?? null,
    finishedAt: state.finishedAt ?? null,
  }
}

const shelfBookModel = {
  findByWorkId(workId) {
    return ShelfBook.findOne({ where: { workId } })
  },

  async findStatusesByWorkIds(workIds) {
    const unique = [...new Set(workIds)]
    if (unique.length === 0) return new Map()
    const rows = await ShelfBook.findAll({
      where: { workId: unique },
      attributes: ['workId', 'status'],
    })
    return new Map(rows.map((r) => [r.workId, r.status]))
  },

  async create(entry) {
    try {
      return await ShelfBook.create({
        workId: entry.workId,
        title: entry.title,
        authors: entry.authors,
        coverId: entry.coverId,
        firstPublishYear: entry.firstPublishYear,
        totalPages: entry.totalPages,
        ...readingStateData(entry),
      })
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        const { appError } = require('../lib/errors')
        throw appError('BOOK_ALREADY_IN_SHELF')
      }
      throw err
    }
  },

  list(status) {
    const where = status ? { status } : {}
    return ShelfBook.findAll({ where, order: [['added_at', 'DESC'], ['id', 'DESC']] })
  },

  async countByStatus() {
    const rows = await ShelfBook.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
    })
    const counts = { total: 0, want_to_read: 0, reading: 0, read: 0 }
    for (const row of rows) {
      const n = parseInt(row.get('count'), 10)
      counts[row.status] = n
      counts.total += n
    }
    return counts
  },

  async updateReadingState(workId, compute) {
    return sequelize.transaction(async (t) => {
      const row = await ShelfBook.findOne({ where: { workId }, transaction: t, lock: true })
      if (!row) return null
      const current = toReadingState(row)
      const next = compute(current)
      await row.update(readingStateData(next), { transaction: t })
      return row.reload({ transaction: t })
    })
  },

  async remove(workId) {
    const count = await ShelfBook.destroy({ where: { workId } })
    return count > 0
  },
}

module.exports = { ShelfBook, shelfBookModel, toReadingState }
