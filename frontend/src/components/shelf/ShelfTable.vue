<script setup>
import { ref } from 'vue'
import BookCover from '../books/BookCover.vue'
import ProgressCell from './ProgressCell.vue'
import StarRating from './StarRating.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import { useShelfStore } from '../../stores/shelf'
import { STATUS_OPTIONS } from '../../utils/status'
import { formatDate } from '../../utils/format'

const props = defineProps({
  books: { type: Array, required: true },
  status: { type: String, required: true },
})
const emit = defineEmits(['open'])

const shelf = useShelfStore()

const NOTE_MAX = 500

const noteEditing = ref(new Map())
const noteValues = ref(new Map())

function startNoteEdit(book) {
  noteValues.value.set(book.workId, book.note ?? '')
  noteEditing.value.set(book.workId, true)
}

function cancelNoteEdit(workId) {
  noteEditing.value.delete(workId)
  noteValues.value.delete(workId)
}

async function saveNote(book) {
  const note = (noteValues.value.get(book.workId) ?? '').trim() || null
  noteEditing.value.delete(book.workId)
  noteValues.value.delete(book.workId)
  if (note === (book.note ?? null)) return
  void shelf.update(book.workId, { note })
}

function updateStatus(workId, status) {
  void shelf.update(workId, { status })
}

function updateRating(workId, rating) {
  void shelf.update(workId, { rating })
}

function confirmRemove(book) {
  if (confirm(`Xoá "${book.title}" khỏi tủ sách?`)) {
    void shelf.remove(book.workId, book.title)
  }
}

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th class="th th--cover" />
          <th class="th">Tên sách</th>
          <th class="th th--hide-sm">Tiến độ</th>
          <th class="th">Trạng thái</th>
          <th class="th th--hide-md">Đánh giá</th>
          <th class="th th--hide-lg">Ghi chú</th>
          <th class="th th--hide-md">Bắt đầu</th>
          <th class="th th--action" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books" :key="book.workId" class="row">
          <td class="td td--cover">
            <button type="button" class="cover-btn" @click="emit('open', book.workId)">
              <div style="width:36px;height:52px;border-radius:3px;overflow:hidden;border:1px solid var(--border)">
                <BookCover :cover-id="book.coverId" :title="book.title" size="S" radius="3px" />
              </div>
            </button>
          </td>

          <td class="td td--title">
            <button type="button" class="title-btn clamp-2" @click="emit('open', book.workId)">
              {{ book.title }}
            </button>
            <p class="book-authors clamp-1">{{ book.authors.join(', ') || '—' }}</p>
          </td>

          <td class="td th--hide-sm">
            <ProgressCell :work-id="book.workId" :total-pages="book.totalPages" />
          </td>

          <td class="td">
            <BaseSelect
              :model-value="book.status"
              :options="STATUS_SELECT_OPTIONS"
              @update:model-value="updateStatus(book.workId, $event)"
            />
          </td>

          <td class="td th--hide-md">
            <StarRating
              :model-value="book.rating"
              @update:model-value="updateRating(book.workId, $event)"
            />
          </td>

          <td class="td th--hide-lg note-cell">
            <template v-if="noteEditing.get(book.workId)">
              <div class="note-edit">
                <textarea
                  class="note-input"
                  :value="noteValues.get(book.workId)"
                  :maxlength="NOTE_MAX"
                  rows="2"
                  placeholder="Ghi chú ngắn…"
                  @input="noteValues.set(book.workId, $event.target.value)"
                  @keydown.escape="cancelNoteEdit(book.workId)"
                />
                <div class="note-actions">
                  <button class="note-save" @click="saveNote(book)">Lưu</button>
                  <button class="note-cancel" @click="cancelNoteEdit(book.workId)">Huỷ</button>
                </div>
              </div>
            </template>
            <template v-else>
              <button
                type="button"
                class="note-display"
                :class="{ 'note-display--empty': !book.note }"
                :title="book.note ?? ''"
                @click="startNoteEdit(book)"
              >
                {{ book.note ? book.note : 'Thêm ghi chú…' }}
              </button>
            </template>
          </td>

          <td class="td th--hide-md td--gray tabular">{{ formatDate(book.startedAt) }}</td>

          <td class="td td--action">
            <button
              type="button"
                class="icon-btn del-btn"
                :disabled="shelf.isRemoving(book.workId)"
                title="Xoá khỏi tủ sách"
                aria-label="Xoá khỏi tủ"
                @click="confirmRemove(book)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
</template>

<style scoped>
.table-wrap {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}
.table {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
}
.th {
  padding: 10px 14px;
  font-size: var(--text-sm);
  font-weight: var(--fw-semibold);
  color: var(--gray-600);
  text-align: left;
  background: var(--gray-50);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.th--cover  { width: 56px; }
.th--action { width: 48px; text-align: center; }
.td {
  padding: 10px 14px;
  font-size: var(--text-sm);
  vertical-align: middle;
}
.td--cover  { padding: 8px 8px 8px 14px; }
.td--action { text-align: center; }
.row {
  border-bottom: 1px solid var(--border);
  background: var(--white);
  transition: background var(--dur-fast);
}
.row:nth-child(even) {
  background: var(--gray-50);
}
.row:hover {
  background: var(--slate-100);
}
.row:last-child {
  border-bottom: 0;
}

.cover-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: block;
}

.title-btn {
  display: block;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: var(--text-sm);
  font-weight: var(--fw-semibold);
  color: var(--gray-900);
  padding: 0;
  max-width: 260px;
  transition: color var(--dur-fast);
}
.title-btn:hover {
  color: var(--primary);
}
.book-authors {
  margin: 3px 0 0;
  color: var(--gray-500);
  font-size: var(--text-xs);
  max-width: 260px;
}

.note-cell {
  max-width: 200px;
}
.note-display {
  display: block;
  width: 100%;
  border: 1px dashed transparent;
  background: transparent;
  text-align: left;
  font-size: var(--text-xs);
  color: var(--gray-700);
  cursor: pointer;
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
  transition: border-color var(--dur-fast), background var(--dur-fast);
}
.note-display:hover {
  border-color: var(--gray-300);
  background: var(--gray-100);
}
.note-display--empty {
  color: var(--gray-400);
  font-style: italic;
}
.note-edit {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.note-input {
  width: 100%;
  min-width: 160px;
  padding: 4px 6px;
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-family: var(--font-sans);
  resize: vertical;
  outline: none;
}
.note-actions {
  display: flex;
  gap: 4px;
}
.note-save, .note-cancel {
  height: 22px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--fw-medium);
  cursor: pointer;
  border: 1px solid;
}
.note-save   { background: var(--primary); border-color: var(--primary); color: var(--white); }
.note-cancel { background: var(--white); border-color: var(--border); color: var(--gray-700); }

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--gray-400);
  transition:
    background var(--dur-fast),
    color var(--dur-fast);
}
.del-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
}
.del-btn:not(:disabled):hover {
  background: var(--error-soft);
  color: var(--error);
}
.del-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 1100px) { .th--hide-lg, .td.th--hide-lg { display: none; } }
@media (max-width: 900px)  { .th--hide-md, .td.th--hide-md  { display: none; } }
@media (max-width: 640px)  { .th--hide-sm, .td.th--hide-sm  { display: none; } }
</style>
