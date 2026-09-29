<script setup>
import { computed } from 'vue'

const props = defineProps({
  counts: { type: Object, default: null },
})
const emit = defineEmits(['select'])

const KPIS = [
  { status: 'want_to_read', label: 'Muốn đọc' },
  { status: 'reading', label: 'Đang đọc' },
  { status: 'read', label: 'Đã đọc xong' },
]

const donePercent = computed(() => {
  const counts = props.counts
  return counts && counts.total > 0 ? Math.round((counts.read / counts.total) * 100) : 0
})
</script>

<template>
  <div class="stats">
    <div class="card total-card">
      <div class="total">
        <div class="total__top">
          <span class="total__label">Tổng số sách</span>
          <span class="total__done">Đã đọc xong {{ donePercent }}%</span>
        </div>
        <div class="total__value">
          <span class="total__count tabular">{{ counts?.total ?? '—' }}</span>
          <span class="total__unit">cuốn</span>
        </div>
      </div>
    </div>
    <div
      v-for="kpi in KPIS"
      :key="kpi.status"
      class="card kpi-card"
      :class="`kpi-card--${kpi.status}`"
      role="button"
      tabindex="0"
      :aria-label="`Xem tab ${kpi.label}`"
      @click="emit('select', kpi.status)"
      @keydown.enter="emit('select', kpi.status)"
      @keydown.space.prevent="emit('select', kpi.status)"
    >
      <div class="kpi-card__top">
        <span class="kpi-card__label">{{ kpi.label }}</span>
        <span class="kpi-card__dot" />
      </div>
      <div class="kpi-card__value">
        <span class="kpi-card__count tabular">{{ counts ? counts[kpi.status] : '—' }}</span>
        <span class="kpi-card__unit">cuốn</span>
      </div>
      <div class="kpi-card__action">
        <span>Xem</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition:
    border-color var(--dur-fast),
    box-shadow var(--dur-fast);
}
.total {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 18px;
}
.total__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.total__label {
  font-size: var(--text-sm);
  font-weight: var(--fw-semibold);
  color: var(--gray-500);
}
.total__done {
  font-size: 11px;
  color: var(--gray-500);
}
.total__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.total__count {
  font-size: 28px;
  font-weight: var(--fw-bold);
  line-height: 1;
  color: var(--gray-900);
}
.total__unit {
  font-size: var(--text-base);
  font-weight: var(--fw-semibold);
  color: var(--gray-700);
}

.kpi-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px 18px;
  cursor: pointer;
  outline: none;
}
.kpi-card:hover {
  border-color: var(--gray-300);
  box-shadow: var(--shadow-md);
}
.kpi-card:focus-visible {
  outline: 2px solid var(--primary-hover);
  outline-offset: -1px;
}
.kpi-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.kpi-card__label {
  font-size: var(--text-sm);
  font-weight: var(--fw-semibold);
  color: var(--gray-700);
}
.kpi-card__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}
.kpi-card--want_to_read .kpi-card__dot {
  background: var(--warn-amber);
}
.kpi-card--reading .kpi-card__dot {
  background: var(--primary);
}
.kpi-card--read .kpi-card__dot {
  background: var(--status-done-fg);
}
.kpi-card__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 6px;
}
.kpi-card__count {
  font-size: 28px;
  font-weight: var(--fw-bold);
  line-height: 1;
  color: var(--gray-900);
}
.kpi-card__unit {
  font-size: var(--text-base);
  font-weight: var(--fw-semibold);
  color: var(--gray-700);
}
.kpi-card__action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: var(--fw-medium);
  color: var(--gray-400);
  margin-top: 6px;
  transition: color var(--dur-fast);
}
.kpi-card:hover .kpi-card__action {
  color: var(--primary);
}

@media (max-width: 960px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }
  .total, .kpi-card {
    padding: 10px 12px;
  }
  .total__count, .kpi-card__count {
    font-size: 22px;
  }
}
</style>
