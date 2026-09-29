'use strict'

class TtlCache {
  constructor({ max, ttlMs }) {
    this.max = max
    this.ttlMs = ttlMs
    this.map = new Map()
    this.inflight = new Map()
  }

  _isExpired(entry) {
    return Date.now() - entry.ts > this.ttlMs
  }

  get(key) {
    const entry = this.map.get(key)
    if (!entry || this._isExpired(entry)) return undefined
    return entry.value
  }

  set(key, value) {
    if (this.map.size >= this.max && !this.map.has(key)) {
      const oldest = this.map.keys().next().value
      this.map.delete(oldest)
    }
    this.map.set(key, { value, ts: Date.now() })
  }

  async getOrLoad(key, loader) {
    const cached = this.get(key)
    if (cached !== undefined) return cached

    if (this.inflight.has(key)) return this.inflight.get(key)

    const promise = loader().then(
      (value) => {
        this.set(key, value)
        this.inflight.delete(key)
        return value
      },
      (err) => {
        this.inflight.delete(key)
        throw err
      },
    )
    this.inflight.set(key, promise)
    return promise
  }
}

function createTtlCache(opts) {
  return new TtlCache(opts)
}

module.exports = { createTtlCache }
