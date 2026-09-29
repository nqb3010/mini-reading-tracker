<script setup>
import { computed, ref, watch } from 'vue'
import { useShelfStore } from '../../stores/shelf'
import { formatNumber } from '../../utils/format'
import { errorCode, errorMessage } from '../../utils/errors'

const props = defineProps({ workId: { type: String, required: true }, totalPages: { type: Number, default: null } })

const shelf = useShelfStore()
const book = computed(() => shelf.items.find((b) => b.workId === props.workId))
const updating = computed(() => shelf.isUpdating(props.workId))

const inputVal = ref('')
const inputError = ref('')

watch(
  () => book.value?.currentPage,
  (v) => { if (v !== undefined) inputVal.value = String(v) },
  { immediate: true },
)

async function onPageBlur() {
  const n = parseInt(inputVal.value, 10)
  if (isNaN(n) || n === book.value?.currentPage) { inputVal.value = String(book.value?.currentPage ?? 0); return }
  inputError.value = ''
  const result = await shelf.update(props.workId, { currentPage: n })
  if (!result.ok && result.error?.code === 'VALIDATION_ERROR') {
    inputError.value = result.error.details?.[0]?.message ?? result.error.message
    inputVal.value = String(book.value?.currentPage ?? 0)
  }
}

const progress = computed(() => {
  const b = book.value
  if (!b || !b.totalPages) return null
  return Math.round((b.currentPage / b.totalPages) * 100)
})
</script>

<template>
  <div class="progress-cell">
    <div v-if="totalPages" class="progress-cell__input-row">
      <input
        v-model="inputVal"
        class="page-input"
        type="number"
        :min="0"
        :max="totalPages"
        :disabled="updating"
        aria-label="Trang hiện tại"
        @blur="onPageBlur"
        @keydown.enter.prevent="$event.target.blur()"
      />
      <span class="progress-cell__sep">/</span>
      <span class="progress-cell__total tabular">{{ formatNumber(totalPages) }}</span>
    </div>
    <span v-else class="progress-cell--none">—</span>
    <div v-if="totalPages && progress !== null" class="progress-cell__bar">
      <div class="progress-cell__fill" :style="{ width: `${progress}%` }" />
    </div>
    <p v-if="inputError" class="progress-cell__err">{{ inputError }}</p>
  </div>
</template>

<style scoped>
.progress-cell { display: flex; flex-direction: column; gap: 4px; }
.progress-cell__input-row { display: flex; align-items: center; gap: 4px; }
.page-input {
  width: 64px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  text-align: right;
  outline: none;
}
.page-input:focus { border-color: var(--primary); }
.page-input:disabled { opacity: 0.6; cursor: not-allowed; }
.progress-cell__sep { color: var(--gray-400); font-size: var(--text-sm); }
.progress-cell__total { font-size: var(--text-sm); color: var(--gray-600); }
.progress-cell--none { font-size: var(--text-sm); color: var(--gray-400); }
.progress-cell__bar {
  width: 100%;
  max-width: 140px;
  height: 4px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-cell__fill {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
  transition: width var(--dur-normal);
}
.progress-cell__err { margin: 0; font-size: var(--text-xs); color: var(--error); }
</style>
