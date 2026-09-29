'use strict'

require('dotenv').config()

const { Sequelize } = require('sequelize')
const config = require('../config/env')

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: 'mysql',
  logging: false,
})

const SAMPLE_BOOKS = [
  {
    work_id: 'OL27516W',
    title: 'Dune',
    authors: JSON.stringify(['Frank Herbert']),
    cover_id: 8225578,
    first_publish_year: 1965,
    total_pages: 412,
    status: 'read',
    current_page: 412,
    rating: 5,
    note: 'Kiệt tác SF. Cần đọc lại phần 2.',
    started_at: '2024-01-10',
    finished_at: '2024-02-03',
    added_at: new Date('2024-01-10'),
    updated_at: new Date('2024-02-03'),
  },
  {
    work_id: 'OL45883W',
    title: 'The Lord of the Rings',
    authors: JSON.stringify(['J.R.R. Tolkien']),
    cover_id: 9255566,
    first_publish_year: 1954,
    total_pages: 1178,
    status: 'reading',
    current_page: 480,
    rating: null,
    note: null,
    started_at: '2024-03-01',
    finished_at: null,
    added_at: new Date('2024-03-01'),
    updated_at: new Date('2024-04-15'),
  },
  {
    work_id: 'OL1168083W',
    title: '1984',
    authors: JSON.stringify(['George Orwell']),
    cover_id: 8575708,
    first_publish_year: 1949,
    total_pages: 328,
    status: 'want_to_read',
    current_page: 0,
    rating: null,
    note: 'Được giới thiệu bởi đồng nghiệp.',
    started_at: null,
    finished_at: null,
    added_at: new Date('2024-04-20'),
    updated_at: new Date('2024-04-20'),
  },
  {
    work_id: 'OL257943W',
    title: 'The Hitchhiker\'s Guide to the Galaxy',
    authors: JSON.stringify(['Douglas Adams']),
    cover_id: 8224161,
    first_publish_year: 1979,
    total_pages: 193,
    status: 'read',
    current_page: 193,
    rating: 4,
    note: null,
    started_at: '2023-11-05',
    finished_at: '2023-11-18',
    added_at: new Date('2023-11-05'),
    updated_at: new Date('2023-11-18'),
  },
  {
    work_id: 'OL50376W',
    title: 'Clean Code',
    authors: JSON.stringify(['Robert C. Martin']),
    cover_id: null,
    first_publish_year: 2008,
    total_pages: 431,
    status: 'reading',
    current_page: 120,
    rating: null,
    note: 'Chương 3 về Functions rất hay.',
    started_at: '2024-05-01',
    finished_at: null,
    added_at: new Date('2024-05-01'),
    updated_at: new Date('2024-05-10'),
  },
]

async function seed() {
  await sequelize.authenticate()
  console.log('[seed] Connected to MySQL.')

  for (const book of SAMPLE_BOOKS) {
    const [rows] = await sequelize.query(
      'SELECT id FROM shelf_books WHERE work_id = ? LIMIT 1',
      { replacements: [book.work_id] },
    )
    if (rows.length > 0) {
      console.log(`[seed] Skipping "${book.title}" (already exists).`)
      continue
    }
    await sequelize.query(
      `INSERT INTO shelf_books
        (work_id, title, authors, cover_id, first_publish_year, total_pages,
         status, current_page, rating, note, started_at, finished_at, added_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          book.work_id, book.title, book.authors,
          book.cover_id ?? null, book.first_publish_year ?? null, book.total_pages ?? null,
          book.status, book.current_page,
          book.rating ?? null, book.note ?? null,
          book.started_at ?? null, book.finished_at ?? null,
          book.added_at, book.updated_at,
        ],
      },
    )
    console.log(`[seed] Inserted "${book.title}".`)
  }

  await sequelize.close()
  console.log('[seed] Done.')
}

seed().catch((err) => {
  console.error('[seed error]', err)
  process.exit(1)
})
