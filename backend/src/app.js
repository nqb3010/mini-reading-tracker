'use strict'

const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yaml')

const OPENAPI_PATH = path.join(__dirname, 'docs', 'openapi.yaml')
let openApiDocument
function loadOpenApiDocument() {
  if (!openApiDocument) {
    openApiDocument = YAML.parse(fs.readFileSync(OPENAPI_PATH, 'utf8'))
  }
  return openApiDocument
}

const config = require('./config/env')
const sequelize = require('./db/sequelize')
const { ShelfBook } = require('./models/ShelfBook')
const { createOpenLibraryClient } = require('./integrations/openLibrary/client')
const { createBooksService } = require('./services/books.service')
const { createShelfService } = require('./services/shelf.service')
const { createBooksController } = require('./controllers/books.controller')
const { createShelfController } = require('./controllers/shelf.controller')
const { createCoversController } = require('./controllers/covers.controller')
const { createHealthController } = require('./controllers/health.controller')
const { createApiRouter } = require('./routes')
const { errorHandler } = require('./middleware/errorHandler')
const { shelfBookModel } = require('./models/ShelfBook')

function createApp() {
  const openLibrary = createOpenLibraryClient({
    baseUrl: config.OPENLIBRARY_BASE_URL,
    coversUrl: config.OPENLIBRARY_COVERS_URL,
    timeoutMs: config.OPENLIBRARY_TIMEOUT_MS,
    userAgent: config.OPENLIBRARY_USER_AGENT,
  })

  const booksService = createBooksService({ openLibrary, shelfBookModel, config })
  const shelfService = createShelfService({
    shelfBookModel,
    booksService,
    config,
    now: () => new Date(),
  })

  const controllers = {
    health: createHealthController({ sequelize }),
    books: createBooksController({ booksService }),
    covers: createCoversController({ openLibrary }),
    shelf: createShelfController({ shelfService }),
  }

  const app = express()
  app.disable('x-powered-by')
  app.use(morgan('dev'))
  app.use(helmet({ contentSecurityPolicy: false }))
  app.use(cors({ origin: config.CORS_ORIGINS }))
  app.use(express.json({ limit: '10kb' }))
  const openApi = loadOpenApiDocument()
  app.get('/api/docs.json', (_req, res) => {
    res.json(openApi)
  })
  
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApi))

  app.use('/api', createApiRouter(controllers))

  app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } }))
  app.use(errorHandler)

  return app
}

module.exports = { createApp }
