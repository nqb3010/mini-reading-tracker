import { onScopeDispose, ref, shallowRef, toValue, watch } from 'vue'
import { getBookDetail } from '../api/books'
import { isAbortError } from '../api/http'
import { toApiError } from '../utils/errors'

export function useBookDetail(workId) {
  const status = ref('loading')
  const detail = shallowRef(null)
  const error = shallowRef(null)
  let controller = null

  async function load(options = {}) {
    controller?.abort()
    const current = new AbortController()
    controller = current
    if (!options.silent || !detail.value) status.value = 'loading'
    error.value = null
    try {
      const data = await getBookDetail(toValue(workId), current.signal)
      if (current.signal.aborted) return
      detail.value = data
      status.value = 'ok'
    } catch (caught) {
      if (current.signal.aborted || isAbortError(caught)) return
      if (options.silent && detail.value) return
      error.value = toApiError(caught)
      status.value = 'error'
    }
  }

  watch(() => toValue(workId), () => load(), { immediate: true })
  onScopeDispose(() => controller?.abort())

  return {
    status,
    detail,
    error,
    retry: () => load(),
    refresh: () => load({ silent: true }),
  }
}
