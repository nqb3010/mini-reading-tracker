<script setup>
import { formatNumber } from '../../utils/format'
import { statusLabel } from '../../utils/status'

const props = defineProps({ counts: { type: Object, default: null } })
const emit = defineEmits(['select'])

const STATS = [
  { key: 'want_to_read', label: 'Muốn đọc' },
  { key: 'reading',      label: 'Đang đọc' },
  { key: 'read',         label: 'Đã đọc' },
]
</script>

<template>
  <div class="stats">
    <button
      v-for="s in STATS"
      :key="s.key"
      type="button"
      class="stat"
      @click="emit('select', s.key)"
    >
      <span class="stat__num tabular">{{ counts ? formatNumber(counts[s.key]) : '—' }}</span>
      <span class="stat__label">{{ s.label }}</span>
    </button>
    <div class="stat stat--total">
      <span class="stat__num tabular">{{ counts ? formatNumber(counts.total) : '—' }}</span>
      <span class="stat__label">Tổng cộng</span>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--white);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--dur-fast), background var(--dur-fast);
}
.stat:hover { border-color: var(--primary); background: var(--primary-soft); }
.stat--total { cursor: default; }
.stat--total:hover { border-color: var(--border); background: var(--white); }
.stat__num { font-size: 22px; font-weight: var(--fw-bold); color: var(--gray-900); }
.stat__label { font-size: var(--text-sm); color: var(--gray-500); }
@media (max-width: 640px) { .stats { grid-template-columns: repeat(2, 1fr); } }
</style>
