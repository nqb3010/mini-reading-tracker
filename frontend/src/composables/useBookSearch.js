import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'
import { searchBooks, MAX_SEARCH_PAGE } from '../api/books'
import { isAbortError } from '../api/http'
import { listShelf } from '../api/shelf'
import { useShelfStore } from '../stores/shelf'
import { toApiError } from '../utils/errors'
import { queryParam, useQueryState } from './useQueryState'

export const QUERY_MAX_LENGTH = 200
const PAGE_SIZE = 20

export function normalizeQuery(value) {
  return value.replace(/\s+/gu, ' ').trim()
}

export function shelfBookToSummary(book) {
  return {
    workId: book.workId,
    title: book.title,
    authors: book.authors,
    firstPublishYear: book.firstPublishYear,
    coverId: book.coverId,
    totalPages: book.totalPages,
    inShelf: true,
    shelfStatus: book.status,
  }
}

async function loadShelfPage(page, signal) {
  const { items } = await listShelf(undefined, 'recent', signal)
  const start = (page - 1) * PAGE_SIZE
  return {
    query: null,
    page,
    pageSize: PAGE_SIZE,
    total: items.length,
    totalPages: Math.ceil(items.length / PAGE_SIZE),
    items: items.slice(start, start + PAGE_SIZE).map(shelfBookToSummary),
  }
}

export function useBookSearch() {
  const shelf = useShelfStore()
  const { state: params, update } = useQueryState({
    q: queryParam.string(''),
    page: queryParam.int(1, MAX_SEARCH_PAGE, 1),
    view: queryParam.oneOf(['grid', 'list'], 'grid'),
  })

  const query = computed(() => normalizeQuery(params.value.q))
  const page = computed(() => params.value.page)
  const view = computed(() => params.value.view)
  const source = computed(() => (query.value ? 'openLibrary' : 'shelf'))

  const status = ref('loading')
  const result = shallowRef(null)
  const error = shallowRef(null)
  let controller = null

  async function load() {
    controller?.abort()
    const current = new AbortController()
    controller = current
    status.value = 'loading'
    error.value = null
    const q = query.value
    try {
      const data = q
        ? await searchBooks(q, page.value, current.signal)
        : await loadShelfPage(page.value, current.signal)
      if (current.signal.aborted) return
      if (!q && data.totalPages > 0 && page.value > data.totalPages) {
        void update({ page: data.totalPages }, 'replace')
        return
      }
      result.value = data
      shelf.rememberStatuses(data.items)
      status.value = data.items.length > 0 ? 'ok' : 'empty'
    } catch (caught) {
      if (current.signal.aborted || isAbortError(caught)) return
      error.value = toApiError(caught)
      status.value = 'error'
    }
  }

  watch([query, page], load, { immediate: true })
  onScopeDispose(() => controller?.abort())

  function submit(text) {
    const q = normalizeQuery(text).slice(0, QUERY_MAX_LENGTH)
    if (q === query.value && page.value === 1) { void load(); return }
    void update({ q, page: 1 }, 'push')
  }

  function clear() { submit('') }
  function goToPage(next) { void update({ page: next }, 'push') }
  function setView(next) { void update({ view: next }, 'replace') }

  return { query, page, view, source, status, result, error, submit, clear, goToPage, setView, retry: load }
}
