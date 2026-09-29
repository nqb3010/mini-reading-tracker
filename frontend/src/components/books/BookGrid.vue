<script setup>
import BookCover from './BookCover.vue'
import { useShelfStore } from '../../stores/shelf'
import { statusLabel } from '../../utils/status'

defineProps({ books: { type: Array, required: true }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['open'])
const shelf = useShelfStore()

const SKELETONS = Array.from({ length: 20 })
</script>

<template>
  <div class="grid">
    <template v-if="loading">
      <div v-for="(_, i) in SKELETONS" :key="i" class="card card--skel">
        <div class="rt-skel card__cover-skel" />
        <div class="card__body">
          <div class="rt-skel" style="height:12px;width:85%" />
          <div class="rt-skel" style="height:10px;width:50%;margin-top:4px" />
        </div>
      </div>
    </template>
    <template v-else>
      <button
        v-for="book in books"
        :key="book.workId"
        type="button"
        class="card"
        @click="emit('open', book.workId)"
      >
        <div class="card__cover">
          <BookCover :cover-id="book.coverId" :title="book.title" size="M" radius="4px" />
          <span v-if="book.inShelf" class="card__badge">{{ statusLabel(book.shelfStatus) }}</span>
        </div>
        <div class="card__body">
          <p class="card__title clamp-2">{{ book.title }}</p>
          <p class="card__authors clamp-1">{{ book.authors.join(', ') || 'Không rõ tác giả' }}</p>
        </div>
      </button>
    </template>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-4);
}
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 0;
  border-radius: var(--radius-md);
  transition: opacity var(--dur-fast);
}
.card:hover { opacity: 0.82; }
.card__cover {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: 4px;
  overflow: hidden;
  background: var(--gray-100);
  border: 1px solid var(--border);
}
.card__cover-skel { aspect-ratio: 2/3; width: 100%; }
.card--skel { cursor: default; }
.card__badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: var(--text-xs);
  font-weight: var(--fw-medium);
}
.card__body { padding: 0 2px; }
.card__title { margin: 0; font-size: var(--text-sm); font-weight: var(--fw-semibold); color: var(--gray-900); }
.card__authors { margin: 2px 0 0; font-size: var(--text-xs); color: var(--gray-500); }
</style>
