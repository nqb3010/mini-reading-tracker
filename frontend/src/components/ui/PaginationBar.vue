<script setup>
defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})
const emit = defineEmits(['change'])

function pages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, 2, current - 1, current, current + 1, total - 1, total])
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result = []
  let prev = null
  for (const p of sorted) {
    if (prev !== null && p - prev > 1) result.push('…')
    result.push(p)
    prev = p
  }
  return result
}
</script>

<template>
  <nav class="pag" aria-label="Trang">
    <button
      class="pag__btn"
      :disabled="page <= 1"
      aria-label="Trang trước"
      @click="emit('change', page - 1)"
    >‹</button>
    <template v-for="(p, i) in pages(page, totalPages)" :key="i">
      <span v-if="p === '…'" class="pag__ellipsis">…</span>
      <button
        v-else
        class="pag__btn"
        :class="{ 'pag__btn--active': p === page }"
        :aria-current="p === page ? 'page' : undefined"
        @click="emit('change', p)"
      >{{ p }}</button>
    </template>
    <button
      class="pag__btn"
      :disabled="page >= totalPages"
      aria-label="Trang sau"
      @click="emit('change', page + 1)"
    >›</button>
  </nav>
</template>

<style scoped>
.pag {
  display: flex;
  align-items: center;
  gap: 2px;
}
.pag__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--white);
  color: var(--gray-700);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background var(--dur-fast), border-color var(--dur-fast);
}
.pag__btn:not(:disabled):hover { background: var(--gray-50); border-color: var(--gray-300); }
.pag__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag__btn--active { background: var(--primary); border-color: var(--primary); color: var(--white); }
.pag__btn--active:hover { background: var(--primary-hover); border-color: var(--primary-hover); }
.pag__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  color: var(--gray-400);
  font-size: var(--text-sm);
}
</style>
