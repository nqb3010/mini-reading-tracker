<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MAX_SEARCH_PAGE } from '../api/books'
import BookGrid from '../components/books/BookGrid.vue'
import BookTable from '../components/books/BookTable.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import PaginationBar from '../components/ui/PaginationBar.vue'
import SegmentedTabs from '../components/ui/SegmentedTabs.vue'
import StateBlock from '../components/ui/StateBlock.vue'
import { QUERY_MAX_LENGTH, useBookSearch } from '../composables/useBookSearch'
import { errorCode, errorMessage } from '../utils/errors'
import { formatNumber } from '../utils/format'

const SUGGESTED_KEYWORDS = ['Tolkien', 'Harry Potter', 'Orwell', 'Clean Code', 'Tô Hoài']
const LAYOUT_TABS = [
  { value: 'grid', label: 'Lưới' },
  { value: 'list', label: 'Danh sách' },
]

const route = useRoute()
const router = useRouter()
const search = useBookSearch()
const { query, page, view, source, status, result, error } = search

const input = ref('')
const resultBarRef = ref(null)

watch(query, (q) => (input.value = q), { immediate: true })

const layout = computed({
  get: () => view.value,
  set: (value) => search.setView(value),
})

const items = computed(() => result.value?.items ?? [])
const total = computed(() => result.value?.total ?? 0)
const totalPages = computed(() => Math.max(1, Math.min(result.value?.totalPages ?? 1, MAX_SEARCH_PAGE)))
const shownQuery = computed(() => result.value?.query ?? query.value)
const rangeFrom = computed(() => (items.value.length ? (page.value - 1) * 20 + 1 : 0))
const rangeTo = computed(() => (page.value - 1) * 20 + items.value.length)

function onSubmit() { search.submit(input.value) }

function pickKeyword(keyword) {
  input.value = keyword
  search.submit(keyword)
}

function clearQuery() {
  input.value = ''
  search.clear()
}

function changePage(next) {
  search.goToPage(next)
  resultBarRef.value?.scrollIntoView({ block: 'start' })
}

function openBook(workId) {
  void router.push({ query: { ...route.query, book: workId } })
}
</script>

<template>
  <main class="rt-page">
    <nav class="breadcrumb" aria-label="Đường dẫn">
      <ol class="breadcrumb__list">
        <li class="breadcrumb__item"><RouterLink to="/" class="breadcrumb__link">Trang chủ</RouterLink></li>
        <li class="breadcrumb__item"><span class="breadcrumb__sep">/</span><span class="breadcrumb__current">Tìm kiếm sách</span></li>
      </ol>
    </nav>
    <div class="rt-title-row">
      <div>
        <h1 class="rt-h1">Tìm kiếm sách</h1>
        <p class="rt-sub">Tìm theo tên sách hoặc tác giả trong thư viện Open Library, rồi thêm vào tủ sách.</p>
      </div>
    </div>

    <div class="search-card">
      <form class="search-form" role="search" @submit.prevent="onSubmit">
        <div class="search-field">
          <svg class="search-field__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            v-model="input"
            class="input search-input"
            enterkeyhint="search"
            aria-label="Tên sách hoặc tác giả"
            placeholder="Nhập tên sách hoặc tác giả, ví dụ: Harry Potter, Tolkien…"
            :maxlength="QUERY_MAX_LENGTH"
          />
          <button v-if="input" type="button" class="clear-btn" aria-label="Xoá từ khoá" @click="clearQuery">✕</button>
        </div>
        <BaseButton type="submit">Tìm kiếm</BaseButton>
      </form>
      <div class="suggest">
        <span class="suggest__label">Gợi ý:</span>
        <button
          v-for="keyword in SUGGESTED_KEYWORDS"
          :key="keyword"
          type="button"
          class="chip"
          @click="pickKeyword(keyword)"
        >{{ keyword }}</button>
      </div>
    </div>

    <div ref="resultBarRef" class="result-bar">
      <div class="result-meta" aria-live="polite">
        <template v-if="status === 'loading'">
          <span class="rt-spin" style="display:inline-block;width:12px;height:12px;border:2px solid var(--primary);border-top-color:transparent;border-radius:50%" aria-hidden="true" />
          {{ source === 'shelf' ? 'Đang tải tủ sách…' : 'Đang tìm kiếm trên Open Library…' }}
        </template>
        <template v-else-if="status === 'ok'">
          <span v-if="shownQuery">
            <strong>{{ formatNumber(total) }}</strong> kết quả cho "<strong>{{ shownQuery }}</strong>"
          </span>
          <span v-else>Sách trong tủ của bạn · <strong>{{ formatNumber(total) }}</strong> cuốn</span>
        </template>
        <span v-else-if="status === 'empty' && query">
          <strong>0</strong> kết quả cho "<strong>{{ query }}</strong>"
        </span>
        <span v-else-if="status === 'empty'">Sách trong tủ của bạn · <strong>0</strong> cuốn</span>
      </div>
      <SegmentedTabs v-model="layout" :tabs="LAYOUT_TABS" aria-label="Bố cục kết quả" />
    </div>

    <template v-if="status === 'loading'">
      <BookGrid v-if="view === 'grid'" :books="[]" loading />
      <BookTable v-else :books="[]" loading />
    </template>

    <StateBlock
      v-else-if="status === 'empty' && source === 'shelf'"
      tone="info"
      title="Tủ sách chưa có cuốn nào"
    >
      Nhập tên sách hoặc tác giả để tìm trên Open Library và thêm vào tủ.
    </StateBlock>

    <StateBlock v-else-if="status === 'empty'" title="Không tìm thấy sách phù hợp">
      Không có kết quả cho "{{ query }}". Hãy thử từ khoá khác.
      <template #action>
        <BaseButton variant="outline" @click="clearQuery">Xoá từ khoá</BaseButton>
      </template>
    </StateBlock>

    <StateBlock
      v-else-if="status === 'error' && error"
      tone="error"
      title="Không thể tải kết quả"
      :meta="errorCode(error)"
    >
      {{ errorMessage(error) }}
      <template #action>
        <BaseButton variant="outline" @click="search.retry">Thử lại</BaseButton>
      </template>
    </StateBlock>

    <template v-else-if="status === 'ok'">
      <template v-if="view === 'grid'">
        <BookGrid :books="items" @open="openBook" />
        <div class="footer-bar">
          <span class="footer-bar__text">
            Hiển thị {{ formatNumber(rangeFrom) }}–{{ formatNumber(rangeTo) }} / {{ formatNumber(total) }} kết quả · 20/trang
          </span>
          <PaginationBar :page="page" :total-pages="totalPages" @change="changePage" />
        </div>
      </template>
      <BookTable v-else :books="items" @open="openBook">
        <template #footer>
          <span class="footer-bar__text">
            Hiển thị {{ formatNumber(rangeFrom) }}–{{ formatNumber(rangeTo) }} / {{ formatNumber(total) }} kết quả
          </span>
          <PaginationBar :page="page" :total-pages="totalPages" @change="changePage" />
        </template>
      </BookTable>
    </template>
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

.search-card {
  padding: 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.search-form { display: flex; gap: var(--space-2); }
.search-field { position: relative; flex: 1; min-width: 0; }
.search-field__icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  pointer-events: none;
}
.search-input {
  display: block;
  width: 100%;
  height: 40px;
  padding: 0 var(--space-8) 0 38px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  background: var(--white);
  color: var(--foreground);
  font-size: var(--text-base);
  outline: none;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
}
.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}
.search-input::placeholder {
  color: var(--gray-400);
}
.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  font-size: 12px;
  border-radius: var(--radius-md);
}
.clear-btn:hover { background: var(--gray-100); color: var(--gray-700); }
.suggest { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-top: var(--space-3); }
.suggest__label { font-size: var(--text-sm); color: var(--gray-500); }
.chip {
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--white);
  color: var(--gray-700);
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  transition: background var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast);
}
.chip:hover { background: var(--primary-soft); border-color: var(--primary); color: var(--primary); }
.result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin: var(--space-5) 0 var(--space-3);
  scroll-margin-top: calc(var(--header-h) + 12px);
}
.result-meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--gray-600);
}
.result-meta strong { font-weight: var(--fw-semibold); color: var(--gray-900); }
.footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  min-height: 64px;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--gray-50);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.footer-bar__text { font-size: var(--text-sm); color: var(--gray-600); font-variant-numeric: tabular-nums; }
@media (max-width: 640px) { .search-form { flex-direction: column; } }
</style>
