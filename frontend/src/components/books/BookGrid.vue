<script setup>
import BookCover from './BookCover.vue'
import AddToShelfButton from './AddToShelfButton.vue'

defineProps({
  books: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['open'])

const SKELETONS = Array.from({ length: 20 })
</script>

<template>
  <div class="grid">
    <template v-if="loading">
      <div v-for="(_, i) in SKELETONS" :key="i" class="card card--skel">
        <div class="rt-skel card__cover-skel" />
        <div class="card__body">
          <div class="rt-skel" style="height: 14px; width: 85%" />
          <div class="rt-skel" style="height: 12px; width: 60%; margin-top: 4px" />
          <div class="rt-skel" style="height: 12px; width: 30%; margin-top: 4px" />
        </div>
        <div class="card__action">
          <div class="rt-skel" style="height: 32px; width: 100%; border-radius: var(--radius-md)" />
        </div>
      </div>
    </template>
    <template v-else>
      <article v-for="book in books" :key="book.workId" class="card">
        <button
          type="button"
          class="card__open"
          title="Xem chi tiết"
          @click="emit('open', book.workId)"
        >
          <BookCover :cover-id="book.coverId" :title="book.title" size="M" />
          <div class="card__body">
            <span class="card__title clamp-2">{{ book.title }}</span>
            <span class="card__author clamp-1">
              {{ book.authors && book.authors.length ? book.authors.join(', ') : 'Không rõ tác giả' }}
            </span>
            <span class="card__year">{{ book.firstPublishYear ?? '—' }}</span>
          </div>
        </button>
        <div class="card__action">
          <AddToShelfButton
            :work-id="book.workId"
            :title="book.title"
            :initial-in-shelf="book.inShelf"
            :initial-status="book.shelfStatus"
            full-width
          />
        </div>
      </article>
    </template>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-4);
}
.card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition:
    border-color var(--dur-fast),
    box-shadow var(--dur-fast);
}
.card:hover {
  border-color: var(--gray-300);
  box-shadow: var(--shadow-md);
}
.card--skel {
  cursor: default;
}
.card__cover-skel {
  aspect-ratio: 2/3;
  width: 100%;
}
.card__open {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0;
  background: none;
  border: 0;
  text-align: left;
  cursor: pointer;
  color: inherit;
  font: inherit;
}
.card__open:focus-visible {
  outline: 2px solid var(--primary-hover);
  outline-offset: -2px;
  border-radius: var(--radius-lg);
}
.card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px var(--space-3) 0;
}
.card__title {
  min-height: calc(13px * 1.35 * 2);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  line-height: 1.35;
  color: var(--gray-900);
}
.card__author {
  font-size: var(--text-sm);
  color: var(--gray-500);
}
.card__year {
  font-size: var(--text-sm);
  color: var(--gray-500);
  font-variant-numeric: tabular-nums;
}
.card__action {
  padding: var(--space-3);
  margin-top: auto;
}
.added {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 32px;
}
.added__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--radius-full);
  background: var(--status-done-bg);
  color: var(--status-done-fg);
  border: 1px solid var(--status-done-bd);
  font-size: 11px;
  font-weight: var(--fw-medium);
}
.added__status {
  font-size: 11px;
  color: var(--gray-500);
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 960px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }
}
</style>
