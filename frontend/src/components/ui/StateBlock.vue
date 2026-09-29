<script setup>
defineProps({
  tone: { type: String, default: 'neutral' },
  title: { type: String, required: true },
  meta: { type: String, default: null },
})
</script>

<template>
  <div class="state" :class="`state--${tone}`">
    <p class="state__title">{{ title }}</p>
    <p v-if="$slots.default" class="state__body"><slot /></p>
    <code v-if="meta" class="rt-code">{{ meta }}</code>
    <div v-if="$slots.action" class="state__action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-10) var(--space-4);
  text-align: center;
  color: var(--gray-600);
}
.state__title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: var(--fw-semibold);
  color: var(--gray-800);
}
.state__body { margin: 0; font-size: var(--text-base); }
.state--error .state__title { color: var(--error); }
.state--info .state__title  { color: var(--primary); }
.state__action { margin-top: var(--space-3); }
</style>
