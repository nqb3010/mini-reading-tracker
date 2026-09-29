<script setup>
import { computed, ref, shallowRef } from 'vue'
import { useBookDetail } from '../../composables/useBookDetail'
import { useShelfStore } from '../../stores/shelf'
import { errorCode } from '../../utils/errors'
import { EMPTY_VALUE, formatDate, formatDateTimeVN, formatNumber, todayVN } from '../../utils/format'
import { STATUS_META, STATUS_OPTIONS, isReadingStatus, statusLabel } from '../../utils/status'
import BaseButton from '../ui/BaseButton.vue'
import BaseModal from '../ui/BaseModal.vue'
import SegmentedTabs from '../ui/SegmentedTabs.vue'
import StateBlock from '../ui/StateBlock.vue'
import BookCover from './BookCover.vue'

const props = defineProps({ workId: { type: String, required: true } })
const emit = defineEmits(['close', 'open-shelf'])

const LONG_DESCRIPTION = 420

const shelf = useShelfStore()
const { status, detail, error, retry, refresh } = useBookDetail(() => props.workId)

const initialStatus = ref('want_to_read')
const expanded = ref(false)
const addedEntry = shallowRef(null)

const entry = computed(() => addedEntry.value ?? detail.value?.shelfEntry ?? null)
const displayId = computed(() => detail.value?.workId ?? props.workId)
const adding = computed(() => shelf.isAdding(displayId.value))
const today = formatDate(todayVN())

const isLongDescription = computed(() => (detail.value?.description?.length ?? 0) > LONG_DESCRIPTION)

const hint = computed(() => {
  const pages = detail.value?.totalPages ?? null
  switch (initialStatus.value) {
    case 'reading': return `Ngày bắt đầu đọc được ghi nhận là hôm nay (${today}).`
    case 'read':
      return pages
        ? `Ngày bắt đầu và ngày đọc xong được ghi nhận là hôm nay; tiến độ đặt 100% (${formatNumber(pages)}/${formatNumber(pages)} trang).`
        : 'Ngày bắt đầu và ngày đọc xong được ghi nhận là hôm nay.'
    default: return 'Sách sẽ nằm ở tab "Muốn đọc", tiến độ bắt đầu từ trang 0.'
  }
})

const entrySummary = computed(() => {
  const current = entry.value
  if (!current) return ''
  const progress =
    current.progressPercent !== null && current.status !== 'want_to_read'
      ? ` · tiến độ ${current.progressPercent}%`
      : ''
  return `${statusLabel(current.status)} · thêm ngày ${formatDateTimeVN(current.addedAt)}${progress}`
})

async function add() {
  const book = detail.value
  if (!book || !isReadingStatus(initialStatus.value)) return
  const added = await shelf.add(book.workId, initialStatus.value, book.title)
  if (added) addedEntry.value = added
  else if (shelf.isInShelf(book.workId)) void refresh()
}

function openShelf() {
  if (entry.value) emit('open-shelf', entry.value.status)
}
</script>

<template>
  <BaseModal :width="880" @close="emit('close')">
    <template #title>
      <span class="head">
        Chi tiết sách
        <code class="rt-code">/works/{{ displayId }}</code>
      </span>
    </template>

    <div v-if="status === 'loading'" class="detail" aria-busy="true">
      <div class="detail__cover">
        <div class="rt-skel" style="aspect-ratio:2/3;border-radius:4px" />
      </div>
      <div class="skeleton">
        <div class="rt-skel" style="height:22px;width:70%" />
        <div class="rt-skel" style="height:14px;width:35%" />
        <div class="rt-skel" style="height:58px;margin:8px 0" />
        <div v-for="w in [96,92,98,60]" :key="w" class="rt-skel" :style="{height:'12px',width:`${w}%`}" />
      </div>
    </div>

    <template v-else-if="status === 'error' && error">
      <StateBlock
        v-if="error.code === 'BOOK_NOT_FOUND'"
        title="Không tìm thấy sách"
        :meta="errorCode(error)"
      />
      <StateBlock v-else tone="error" title="Không thể tải chi tiết sách" :meta="errorCode(error)">
        {{ error.message }}
        <template #action>
          <BaseButton variant="outline" @click="retry">Thử lại</BaseButton>
        </template>
      </StateBlock>
    </template>

    <div v-else-if="detail" class="detail">
      <div class="detail__cover">
        <BookCover
          :cover-id="detail.coverId"
          :title="detail.title"
          size="L"
          radius="4px"
          class="detail__cover-img"
        />
      </div>
      <div class="detail__body">
        <h3 class="detail__title">{{ detail.title }}</h3>
        <div class="detail__authors">{{ detail.authors.join(', ') || 'Không rõ tác giả' }}</div>
        <div v-if="entry" class="detail__status-badge">{{ statusLabel(entry.status) }}</div>

        <dl class="meta">
          <div>
            <dt>Năm xuất bản</dt>
            <dd>{{ detail.firstPublishYear ?? EMPTY_VALUE }}</dd>
          </div>
          <div>
            <dt>Số trang</dt>
            <dd>{{ detail.totalPages ? `${formatNumber(detail.totalPages)} trang` : 'Chưa có dữ liệu' }}</dd>
          </div>
          <div>
            <dt>Chủ đề</dt>
            <dd>{{ detail.subjects.length }} chủ đề</dd>
          </div>
        </dl>

        <h4 class="rt-section-label">Mô tả</h4>
        <template v-if="detail.description">
          <p class="description" :class="{ 'clamp-6': !expanded }">{{ detail.description }}</p>
          <BaseButton v-if="isLongDescription" variant="link" @click="expanded = !expanded">
            {{ expanded ? 'Thu gọn' : 'Xem thêm' }}
          </BaseButton>
        </template>
        <p v-else class="description description--empty">Open Library chưa có mô tả cho tác phẩm này.</p>

        <h4 class="rt-section-label subjects-label">Chủ đề</h4>
        <div v-if="detail.subjects.length" class="subjects">
          <span v-for="s in detail.subjects" :key="s" class="subject-chip">{{ s }}</span>
        </div>
        <p v-else class="description description--empty">Chưa có dữ liệu</p>
      </div>
    </div>

    <template #footer>
      <div class="foot">
        <template v-if="entry">
          <div class="foot__info">
            <span class="foot__added">Đã có trong tủ</span>
            <span class="foot__text">{{ entrySummary }}</span>
          </div>
          <div class="foot__actions">
            <BaseButton variant="outline" @click="emit('close')">Đóng</BaseButton>
            <BaseButton variant="secondary" @click="openShelf">Mở tủ sách</BaseButton>
          </div>
        </template>
        <template v-else>
          <div class="foot__choose">
            <span class="foot__label">Trạng thái ban đầu</span>
            <SegmentedTabs v-model="initialStatus" :tabs="STATUS_OPTIONS" aria-label="Trạng thái ban đầu" />
            <span class="foot__text">{{ hint }}</span>
          </div>
          <div class="foot__actions">
            <BaseButton variant="outline" @click="emit('close')">Đóng</BaseButton>
            <BaseButton :loading="adding" :disabled="status !== 'ok'" @click="add">
              {{ adding ? 'Đang thêm…' : 'Thêm vào tủ' }}
            </BaseButton>
          </div>
        </template>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.head { display: inline-flex; align-items: center; gap: 8px; }
.detail {
  display: grid;
  grid-template-columns: 200px minmax(0,1fr);
  gap: var(--space-6);
}
.detail__cover-img { border: 1px solid var(--border); }
.detail__body { min-width: 0; }
.detail__title { margin: 0; font-size: 20px; font-weight: var(--fw-bold); color: var(--gray-900); }
.detail__authors { margin-top: 4px; font-size: var(--text-base); color: var(--gray-600); }
.detail__status-badge {
  display: inline-block;
  margin-top: 10px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--primary-soft);
  color: var(--primary);
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
}
.skeleton { display: flex; flex-direction: column; gap: 10px; }
.meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: var(--space-3);
  margin: var(--space-4) 0 var(--space-5);
  padding: var(--space-3) var(--space-4);
  background: var(--gray-50);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.meta dt { font-size: var(--text-sm); color: var(--gray-500); }
.meta dd { margin: 2px 0 0; font-size: var(--text-base); font-weight: var(--fw-semibold); color: var(--gray-900); font-variant-numeric: tabular-nums; }
.description { margin: 0; font-size: 13px; line-height: 1.7; color: var(--gray-700); white-space: pre-line; overflow-wrap: anywhere; }
.description--empty { font-style: italic; color: var(--gray-400); }
.subjects-label { margin-top: 20px; }
.subjects { display: flex; flex-wrap: wrap; gap: 6px; }
.subject-chip {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: var(--gray-50);
  font-size: var(--text-xs);
  color: var(--gray-700);
}
.foot { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); width: 100%; }
.foot__info { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.foot__added { padding: 2px 10px; border-radius: var(--radius-full); background: var(--status-done-bg); color: var(--status-done-fg); font-size: var(--text-sm); font-weight: var(--fw-medium); }
.foot__choose { display: flex; flex: 1 1 320px; flex-direction: column; gap: 6px; }
.foot__label { font-size: var(--text-sm); font-weight: var(--fw-semibold); color: var(--gray-700); }
.foot__text { font-size: var(--text-sm); color: var(--gray-500); }
.foot__actions { display: flex; gap: 8px; }
@media (max-width: 640px) {
  .detail { grid-template-columns: 1fr; }
  .detail__cover { width: 140px; }
  .meta { grid-template-columns: 1fr 1fr; }
}
</style>
