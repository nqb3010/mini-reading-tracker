import { defineStore } from 'pinia'
import { ref } from 'vue'

export const MAX_TOASTS = 4
export const TOAST_DURATION_MS = {
  success: 4000,
  info: 4000,
  error: 6000,
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  const timers = new Map()
  let sequence = 0

  function dismiss(id) {
    const timer = timers.get(id)
    if (timer !== undefined) clearTimeout(timer)
    timers.delete(id)
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function push(input) {
    const id = ++sequence
    const tone = input.tone ?? input.type ?? 'info'
    const message = input.message ?? input.body
    const duration = input.duration ?? TOAST_DURATION_MS[tone] ?? 4000
    toasts.value = [...toasts.value, { ...input, id, tone, message }]
    while (toasts.value.length > MAX_TOASTS) {
      const oldest = toasts.value[0]
      if (!oldest) break
      dismiss(oldest.id)
    }
    timers.set(id, setTimeout(() => dismiss(id), duration))
    return id
  }

  const success = (title, message) => push({ tone: 'success', title, message })
  const info = (title, message) => push({ tone: 'info', title, message })
  const error = (title, message, meta) => push({ tone: 'error', title, message, meta })

  return { toasts, push, dismiss, success, info, error }
})
