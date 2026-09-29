<script setup>
defineProps({
  modelValue: String,
  tabs: Array,
  ariaLabel: String,
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="seg" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      class="seg__tab"
      :class="{ 'seg__tab--active': modelValue === tab.value }"
      :aria-selected="modelValue === tab.value"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
      <span v-if="tab.count !== null && tab.count !== undefined" class="seg__count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--gray-100);
  padding: 2px;
  gap: 2px;
}
.seg__tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--gray-600);
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  transition: background var(--dur-fast), color var(--dur-fast);
}
.seg__tab:hover { color: var(--gray-800); }
.seg__tab--active {
  background: var(--white);
  color: var(--gray-900);
  box-shadow: 0 1px 2px rgba(0,0,0,.06);
}
.seg__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 14px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: var(--gray-200);
  color: var(--gray-600);
  font-size: var(--text-xs);
  font-weight: var(--fw-semibold);
}
.seg__tab--active .seg__count {
  background: var(--primary-soft);
  color: var(--primary);
}
</style>
