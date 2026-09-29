<script setup>
import BookCover from './BookCover.vue'
import { statusLabel } from '../../utils/status'

defineProps({ books: { type: Array, required: true }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['open'])

const SKELETONS = Array.from({ length: 10 })
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th class="th th--cover" />
          <th class="th">Tên sách</th>
          <th class="th th--hide-sm">Tác giả</th>
          <th class="th th--num">Năm</th>
          <th class="th th--hide-sm">Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="(_, i) in SKELETONS" :key="i">
            <td><div class="rt-skel" style="width:32px;height:46px" /></td>
            <td><div class="rt-skel" style="height:12px;width:70%" /></td>
            <td class="th--hide-sm"><div class="rt-skel" style="height:12px;width:50%" /></td>
            <td><div class="rt-skel" style="height:12px;width:36px" /></td>
            <td class="th--hide-sm"><div class="rt-skel" style="height:12px;width:60px" /></td>
          </tr>
        </template>
        <tr
          v-else
          v-for="book in books"
          :key="book.workId"
          class="row"
          @click="emit('open', book.workId)"
        >
          <td class="td td--cover">
            <div style="width:32px;height:46px;border-radius:3px;overflow:hidden;border:1px solid var(--border)">
              <BookCover :cover-id="book.coverId" :title="book.title" size="S" width="32px" height="46px" radius="3px" :icon-size="16" />
            </div>
          </td>
          <td class="td td--title">
            <span class="book-title clamp-1">{{ book.title }}</span>
          </td>
          <td class="td th--hide-sm td--gray clamp-1">
            {{ book.authors.join(', ') || '—' }}
          </td>
          <td class="td td--gray tabular">{{ book.firstPublishYear ?? '—' }}</td>
          <td class="td th--hide-sm">
            <span v-if="book.inShelf" class="status-chip">{{ statusLabel(book.shelfStatus) }}</span>
            <span v-else class="td--gray">—</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="$slots.footer" class="footer"><slot name="footer" /></div>
  </div>
</template>

<style scoped>
.table-wrap { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
.th {
  padding: 8px 12px;
  font-size: var(--text-xs);
  font-weight: var(--fw-semibold);
  color: var(--gray-500);
  text-align: left;
  background: var(--gray-50);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.th--cover { width: 48px; }
.th--num   { width: 64px; text-align: right; }
.td { padding: 8px 12px; font-size: var(--text-sm); vertical-align: middle; }
.td--cover { padding: 6px 8px 6px 12px; }
.td--title { font-weight: var(--fw-medium); color: var(--gray-900); }
.td--gray  { color: var(--gray-500); }
.row { cursor: pointer; border-bottom: 1px solid var(--gray-100); transition: background var(--dur-fast); }
.row:last-child { border-bottom: 0; }
.row:hover { background: var(--gray-50); }
.book-title { display: block; }
.status-chip {
  display: inline-block;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  background: var(--primary-soft);
  color: var(--primary);
  font-size: var(--text-xs);
  font-weight: var(--fw-medium);
}
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--gray-50);
  border-top: 1px solid var(--border);
}
@media (max-width: 640px) { .th--hide-sm, .td.th--hide-sm { display: none; } }
</style>
