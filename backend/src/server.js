'use strict'

require('dotenv').config()

const sequelize = require('./db/sequelize')
const { ShelfBook } = require('./models/ShelfBook')
const { createApp } = require('./app')
const config = require('./config/env')

async function start() {
  await sequelize.authenticate()
  await sequelize.sync({ alter: false })
  console.log('[db] Connected and synced.')

  const app = createApp()
  app.listen(config.PORT, () => {
    console.log(`[server] http://localhost:${config.PORT}`)
  })
}

start().catch((err) => {
  console.error('[startup error]', err)
  process.exit(1)
})
