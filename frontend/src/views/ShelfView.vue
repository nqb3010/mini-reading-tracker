<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SHELF_SORTS } from '../api/shelf'
import ShelfStats from '../components/shelf/ShelfStats.vue'
import ShelfTable from '../components/shelf/ShelfTable.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import SegmentedTabs from '../components/ui/SegmentedTabs.vue'
import StateBlock from '../components/ui/StateBlock.vue'
import { queryParam, useQueryState } from '../composables/useQueryState'
import { useShelfStore } from '../stores/shelf'
import { errorCode, errorMessage } from '../utils/errors'
import { READING_STATUSES, STATUS_OPTIONS, isReadingStatus, statusLabel } from '../utils/status'

const SORT_OPTIONS = [
  { value: 'recent',   label: 'Mới thêm gần đây' },
  { value: 'title',    label: 'Tên sách (A → Z)' },
  { value: 'progress', label: 'Tiến độ cao nhất' },
  { value: 'rating',   label: 'Đánh giá cao nhất' },
]

const EMPTY_HINT = {
  want_to_read: 'Thêm sách từ trang Tìm kiếm với trạng thái "Muốn đọc" để lên danh sách đọc sau.',
  reading: 'Chuyển một cuốn sang "Đang đọc" để bắt đầu theo dõi tiến độ.',
  read: 'Sách sẽ tự chuyển vào đây khi bạn đọc tới trang cuối cùng.',
}

const SKELETON_ROWS = 4

const route = useRoute()
const router = useRouter()
const shelf = useShelfStore()
const { state, update } = useQueryState({
  status: queryParam.oneOf(READING_STATUSES, 'reading'),
  sort: queryParam.oneOf(SHELF_SORTS, 'recent'),
})

watch(
  () => [state.value.status, state.value.sort],
  ([status, sort]) => void shelf.load(status, sort),
  { immediate: true },
)

const tab = computed({
  get: () => state.value.status,
  set: (value) => { if (isReadingStatus(value)) void update({ status: value }, 'replace') },
})

const sort = computed({
  get: () => state.value.sort,
  set: (value) => void update({ sort: value }, 'replace'),
})

const tabs = computed(() =>
  STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    count: shelf.counts?.[option.value] ?? null,
  })),
)

function selectStatus(status) { void update({ status }, 'replace') }

function openBook(workId) {
  void router.push({ query: { ...route.query, book: workId } })
}
</script>

<template>
  <main class="rt-page">
    <nav class="breadcrumb" aria-label="Đường dẫn">
      <ol class="breadcrumb__list">
        <li class="breadcrumb__item"><RouterLink to="/" class="breadcrumb__link">Trang chủ</RouterLink></li>
        <li class="breadcrumb__item"><span class="breadcrumb__sep">/</span><span class="breadcrumb__current">Tủ sách của tôi</span></li>
      </ol>
    </nav>
    <div class="rt-title-row">
      <div>
        <h1 class="rt-h1">Tủ sách của tôi</h1>
        <p class="rt-sub">Theo dõi tiến độ, đánh giá và ghi chú cho từng cuốn sách.</p>
      </div>
      <BaseButton variant="secondary" to="/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        Tìm thêm sách
      </BaseButton>
    </div>

    <ShelfStats :counts="shelf.counts" @select="selectStatus" />

    <div class="toolbar">
      <SegmentedTabs v-model="tab" :tabs="tabs" aria-label="Lọc theo trạng thái" />
      <label class="sort-label">
        <span class="sort-label__text">Sắp xếp</span>
        <BaseSelect v-model="sort" :options="SORT_OPTIONS" style="width:200px" />
      </label>
    </div>

    <template v-if="shelf.listStatus === 'loading' || shelf.listStatus === 'idle'">
      <div aria-hidden="true">
        <div v-for="i in SKELETON_ROWS" :key="i" class="skel-row">
          <div class="rt-skel" style="width:40px;height:58px" />
          <div class="skel-row__text">
            <div class="rt-skel" style="height:12px;width:35%" />
            <div class="rt-skel" style="height:10px;width:20%;margin-top:4px" />
          </div>
          <div class="rt-skel" style="height:6px;width:160px" />
          <div class="rt-skel" style="height:32px;width:130px;border-radius:var(--radius-md)" />
        </div>
      </div>
    </template>

    <StateBlock
      v-else-if="shelf.listStatus === 'error' && shelf.listError"
      tone="error"
      title="Không thể tải tủ sách"
      :meta="errorCode(shelf.listError)"
    >
      {{ errorMessage(shelf.listError) }}
      <template #action>
        <BaseButton variant="outline" @click="shelf.reload()">Thử lại</BaseButton>
      </template>
    </StateBlock>

    <StateBlock
      v-else-if="shelf.items.length === 0"
      tone="info"
      :title="`Chưa có sách nào ở mục &quot;${statusLabel(state.status)}&quot;`"
    >
      {{ EMPTY_HINT[state.status] }}
      <template #action>
        <BaseButton variant="secondary" to="/">Tìm sách để thêm</BaseButton>
      </template>
    </StateBlock>

    <ShelfTable v-else :books="shelf.items" :status="state.status" @open="openBook" />
  </main>
</template>

<style scoped>
.breadcrumb {
  margin-bottom: var(--space-2);
}
.breadcrumb__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: var(--text-sm);
}
.breadcrumb__link {
  color: var(--gray-500);
  text-decoration: none;
}
.breadcrumb__link:hover {
  color: var(--primary);
}
.breadcrumb__sep {
  color: var(--gray-400);
}
.breadcrumb__current {
  color: var(--gray-900);
  font-weight: var(--fw-medium);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.sort-label { display: flex; align-items: center; gap: 8px; }
.sort-label__text { font-size: var(--text-sm); color: var(--gray-500); white-space: nowrap; }
.skel-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--gray-100);
}
.skel-row__text { flex: 1; display: flex; flex-direction: column; gap: 6px; }
</style>
