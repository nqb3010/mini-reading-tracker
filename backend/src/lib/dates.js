'use strict'

function toDbDate(ymd) {
  return new Date(ymd + 'T00:00:00.000Z')
}

function fromDbDate(date) {
  if (!date) return null
  const d = new Date(date)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayInTimezone(tz, now) {
  const str = now.toLocaleDateString('en-CA', { timeZone: tz })
  return str
}

module.exports = { toDbDate, fromDbDate, todayInTimezone }
