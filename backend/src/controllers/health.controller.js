'use strict'

function createHealthController({ sequelize }) {
  return {
    async check(req, res, next) {
      try {
        await sequelize.authenticate()
        res.json({ status: 'ok', db: 'connected' })
      } catch (err) {
        res.status(503).json({ status: 'error', db: err.message })
      }
    },
  }
}

module.exports = { createHealthController }
