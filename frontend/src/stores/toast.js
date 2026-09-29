import { defineStore } from 'pinia'
import { ref } from 'vue'

let nextId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function add(toast) {
    const id = ++nextId
    toasts.value.push({ id, ...toast })
    setTimeout(() => dismiss(id), toast.duration ?? 4000)
    return id
  }

  function dismiss(id) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function success(title, body) { add({ type: 'success', title, body }) }
  function info(title, body)    { add({ type: 'info',    title, body }) }
  function error(title, body)   { add({ type: 'error',   title, body }) }

  return { toasts, dismiss, success, info, error }
})
