'use strict'

const { Sequelize } = require('sequelize')
const config = require('../config/env')

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: 'mysql',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

module.exports = sequelize
