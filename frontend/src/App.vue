<script setup>
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import ToastViewport from './components/ui/ToastViewport.vue'
import { useShelfStore } from './stores/shelf'

const WORK_ID = /^OL[1-9][0-9]*W$/
const BookDetailModal = defineAsyncComponent(() => import('./components/books/BookDetailModal.vue'))

const route = useRoute()
const router = useRouter()
const shelf = useShelfStore()

onMounted(() => { void shelf.refreshSummary() })

const bookId = computed(() => {
  const raw = route.query.book
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && WORK_ID.test(value) ? value : null
})

function withoutBook(query) {
  const { book: _book, ...rest } = query
  return rest
}

function closeBook() {
  const target = router.resolve({ path: route.path, query: withoutBook(route.query) })
  const back = window.history.state?.back
  if (back === target.fullPath) router.back()
  else void router.replace(target)
}

function openShelf(status) {
  void router.push({ path: '/shelf', query: status === 'reading' ? {} : { status } })
}
</script>

<template>
  <AppHeader :shelf-count="shelf.counts?.total ?? null" />
  <RouterView />
  <BookDetailModal
    v-if="bookId"
    :key="bookId"
    :work-id="bookId"
    @close="closeBook"
    @open-shelf="openShelf"
  />
  <ToastViewport />
</template>
