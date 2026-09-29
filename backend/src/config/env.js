'use strict'

require('dotenv').config()

const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_NAME: process.env.DB_NAME || 'reading_tracker',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || '',
  APP_TIMEZONE: process.env.APP_TIMEZONE || 'Asia/Ho_Chi_Minh',
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
    : ['http://localhost:5000'],
  SUGGESTION_QUERY: process.env.SUGGESTION_QUERY || 'classic literature',
  OPENLIBRARY_BASE_URL: process.env.OPENLIBRARY_BASE_URL || 'https://openlibrary.org',
  OPENLIBRARY_COVERS_URL: process.env.OPENLIBRARY_COVERS_URL || 'https://covers.openlibrary.org',
  OPENLIBRARY_TIMEOUT_MS: parseInt(process.env.OPENLIBRARY_TIMEOUT_MS || '8000', 10),
  OPENLIBRARY_USER_AGENT:
    process.env.OPENLIBRARY_USER_AGENT || 'MiniReadingTracker/1.0 (contact@example.com)',
}

module.exports = config
