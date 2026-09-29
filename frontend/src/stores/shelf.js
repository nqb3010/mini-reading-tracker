import { defineStore } from 'pinia'
import { reactive, ref, shallowRef } from 'vue'
import { addToShelf, listShelf, removeFromShelf, updateShelfBook } from '../api/shelf'
import { isAbortError } from '../api/http'
import { toApiError } from '../utils/errors'
import { formatDate, formatNumber } from '../utils/format'
import { statusLabel } from '../utils/status'
import { useToastStore } from './toast'

export const useShelfStore = defineStore('shelf', () => {
  const toast = useToastStore()

  const statusByWorkId = reactive(new Map())
  const pendingAdds = reactive(new Set())
  const pendingUpdates = reactive(new Set())
  const pendingRemovals = reactive(new Set())

  const counts = ref(null)
  const items = ref([])
  const filter = ref(null)
  const listStatus = ref('idle')
  const listError = shallowRef(null)

  let listController = null
  const updateQueues = new Map()

  function rememberStatuses(items) {
    for (const item of items) {
      if (item.inShelf) statusByWorkId.set(item.workId, item.shelfStatus)
      else statusByWorkId.delete(item.workId)
    }
  }

  function isInShelf(workId) { return statusByWorkId.has(workId) }
  function statusOf(workId) { return statusByWorkId.get(workId) }
  function isAdding(workId) { return pendingAdds.has(workId) }
  function isUpdating(workId) { return pendingUpdates.has(workId) }
  function isRemoving(workId) { return pendingRemovals.has(workId) }

  async function refreshSummary() {
    try {
      const data = await listShelf(undefined, 'recent')
      counts.value = data.counts
      for (const book of data.items) statusByWorkId.set(book.workId, book.status)
    } catch { /* silently ignore; counts are secondary */ }
  }

  async function load(status, sort) {
    listController?.abort()
    const controller = new AbortController()
    listController = controller
    filter.value = { status, sort }
    listStatus.value = 'loading'
    listError.value = null
    try {
      const data = await listShelf(status, sort, controller.signal)
      if (controller.signal.aborted) return
      items.value = data.items
      counts.value = data.counts
      for (const book of data.items) statusByWorkId.set(book.workId, book.status)
      listStatus.value = 'ok'
    } catch (caught) {
      if (controller.signal.aborted || isAbortError(caught)) return
      listError.value = toApiError(caught)
      listStatus.value = 'error'
    }
  }

  function reload() {
    return filter.value ? load(filter.value.status, filter.value.sort) : Promise.resolve()
  }

  async function add(workId, status, title) {
    if (pendingAdds.has(workId)) return null
    pendingAdds.add(workId)
    try {
      const book = await addToShelf(workId, status)
      statusByWorkId.set(workId, book.status)
      statusByWorkId.set(book.workId, book.status)
      toast.success('Đã thêm vào tủ sách', `"${title}" · ${statusLabel(book.status)}`)
      void refreshSummary()
      return book
    } catch (caught) {
      const error = toApiError(caught)
      if (error.code === 'BOOK_ALREADY_IN_SHELF') {
        if (!statusByWorkId.has(workId)) statusByWorkId.set(workId, null)
        void refreshSummary()
      }
      toast.error(`Không thể thêm "${title}"`, error.message)
      return null
    } finally {
      pendingAdds.delete(workId)
    }
  }

  function applyUpdated(before, book) {
    statusByWorkId.set(book.workId, book.status)
    const index = items.value.findIndex((item) => item.workId === book.workId)
    if (index !== -1) {
      if (filter.value && book.status !== filter.value.status) items.value.splice(index, 1)
      else items.value[index] = book
    }
    if (!before) {
      void refreshSummary()
    } else if (counts.value && before.status !== book.status) {
      counts.value = {
        ...counts.value,
        [before.status]: counts.value[before.status] - 1,
        [book.status]: counts.value[book.status] + 1,
      }
    }
  }

  function announceUpdate(before, book, autoFinished, patch) {
    if (autoFinished) {
      const pages = formatNumber(book.totalPages)
      toast.success('Bạn đã đọc xong!', `"${book.title}" đạt ${pages}/${pages} trang.`)
      return
    }
    if (patch.note !== undefined) {
      toast.success(book.note ? 'Đã lưu ghi chú' : 'Đã xoá ghi chú', `"${book.title}"`)
      return
    }
    if (!before || before.status === book.status) return
    const extra =
      book.status === 'read'
        ? ` · đọc xong ${formatDate(book.finishedAt)}`
        : book.status === 'reading' && !before.startedAt
          ? ` · bắt đầu đọc ${formatDate(book.startedAt)}`
          : ''
    toast.info(`Đã chuyển sang "${statusLabel(book.status)}"`, `"${book.title}"${extra}`)
  }

  async function sendUpdate(workId, patch) {
    const before = items.value.find((item) => item.workId === workId)
    const title = before?.title ?? workId
    pendingUpdates.add(workId)
    try {
      const { book, autoFinished } = await updateShelfBook(workId, patch)
      applyUpdated(before, book)
      announceUpdate(before, book, autoFinished, patch)
      return { ok: true, book, autoFinished }
    } catch (caught) {
      const error = toApiError(caught)
      const shownInline = error.code === 'VALIDATION_ERROR' && patch.currentPage !== undefined
      if (!shownInline) toast.error(`Không thể cập nhật "${title}"`, error.message)
      if (error.code === 'SHELF_BOOK_NOT_FOUND') {
        statusByWorkId.delete(workId)
        void reload()
        void refreshSummary()
      }
      return { ok: false, error }
    } finally {
      pendingUpdates.delete(workId)
    }
  }

  function update(workId, patch) {
    const previous = updateQueues.get(workId)
    const run = () => sendUpdate(workId, patch)
    const next = previous ? previous.then(run, run) : run()
    updateQueues.set(workId, next)
    void next.finally(() => { if (updateQueues.get(workId) === next) updateQueues.delete(workId) })
    return next
  }

  async function remove(workId, title) {
    if (pendingRemovals.has(workId)) return false
    pendingRemovals.add(workId)
    const before = items.value.find((item) => item.workId === workId)
    try {
      await removeFromShelf(workId)
      statusByWorkId.delete(workId)
      items.value = items.value.filter((item) => item.workId !== workId)
      if (counts.value && before) {
        counts.value = {
          ...counts.value,
          total: counts.value.total - 1,
          [before.status]: counts.value[before.status] - 1,
        }
      }
      toast.info('Đã xoá khỏi tủ sách', `"${title}"`)
      void reload()
      return true
    } catch (caught) {
      const error = toApiError(caught)
      toast.error(`Không thể xoá "${title}"`, error.message)
      if (error.code === 'SHELF_BOOK_NOT_FOUND') {
        statusByWorkId.delete(workId)
        void reload()
        void refreshSummary()
      }
      return false
    } finally {
      pendingRemovals.delete(workId)
    }
  }

  return {
    statusByWorkId, pendingAdds, pendingUpdates, pendingRemovals,
    counts, items, filter, listStatus, listError,
    rememberStatuses, isInShelf, statusOf, isAdding, isUpdating, isRemoving,
    refreshSummary, load, reload, add, update, remove,
  }
})
