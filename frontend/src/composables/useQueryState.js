import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

function firstValue(value) {
  const raw = Array.isArray(value) ? value[0] : value
  return raw ?? undefined
}

export const queryParam = {
  string(fallback = '') {
    return { default: fallback, parse: (raw) => raw }
  },
  int(min, max, fallback) {
    return {
      default: fallback,
      parse(raw) {
        if (!/^\d+$/.test(raw)) return undefined
        const value = Number(raw)
        return value >= min && value <= max ? value : undefined
      },
    }
  },
  oneOf(values, fallback) {
    return {
      default: fallback,
      parse: (raw) => (values.includes(raw) ? raw : undefined),
    }
  },
}

export function useQueryState(schema) {
  const route = useRoute()
  const router = useRouter()
  const keys = Object.keys(schema)

  const state = computed(() => {
    const values = {}
    for (const key of keys) {
      const spec = schema[key]
      const raw = firstValue(route.query[key])
      const parsed = raw === undefined ? undefined : spec.parse(raw)
      values[key] = parsed === undefined ? spec.default : parsed
    }
    return values
  })

  function update(patch, mode = 'replace') {
    const query = { ...route.query }
    for (const key of Object.keys(patch)) {
      const spec = schema[key]
      if (!spec) continue
      const value = patch[key]
      if (value === undefined || value === null || value === spec.default) delete query[key]
      else query[key] = spec.serialize ? spec.serialize(value) : String(value)
    }
    return router[mode]({ query })
  }

  return { state, update }
}
