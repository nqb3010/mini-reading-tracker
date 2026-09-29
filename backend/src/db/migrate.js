'use strict'

require('dotenv').config()

const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config/env')

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: 'mysql',
  logging: false,
})

async function migrate() {
  await sequelize.authenticate()
  console.log('[migrate] Connected to MySQL.')

  const qi = sequelize.getQueryInterface()

  const tableExists = await qi.showAllTables().then((tables) => tables.includes('shelf_books'))

  if (!tableExists) {
    await qi.createTable('shelf_books', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      work_id: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(500), allowNull: false },
      authors: { type: DataTypes.JSON, allowNull: false },
      cover_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      first_publish_year: { type: DataTypes.SMALLINT, allowNull: true },
      total_pages: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      status: {
        type: DataTypes.ENUM('want_to_read', 'reading', 'read'),
        allowNull: false,
        defaultValue: 'want_to_read',
      },
      current_page: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      rating: { type: DataTypes.TINYINT.UNSIGNED, allowNull: true },
      note: { type: DataTypes.STRING(500), allowNull: true },
      started_at: { type: DataTypes.DATEONLY, allowNull: true },
      finished_at: { type: DataTypes.DATEONLY, allowNull: true },
      added_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    })

    await qi.addIndex('shelf_books', ['status', 'added_at'], {
      name: 'ix_shelf_books_status_added',
    })

    await qi.addConstraint('shelf_books', {
      fields: ['rating'],
      type: 'check',
      name: 'chk_rating_range',
      where: { rating: { [Sequelize.Op.between]: [1, 5] } },
    }).catch(() => { /* MySQL 5.7 does not enforce CHECK; skip silently */ })

    console.log('[migrate] Created table shelf_books.')
  } else {
    console.log('[migrate] Table shelf_books already exists. Skipping.')
  }

  await sequelize.close()
  console.log('[migrate] Done.')
}

migrate().catch((err) => {
  console.error('[migrate error]', err)
  process.exit(1)
})
