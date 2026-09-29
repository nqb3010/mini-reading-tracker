<script setup>
const props = defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  to: { type: String, default: null },
})
const emit = defineEmits(['click'])
</script>

<template>
  <RouterLink v-if="to" :to="to" class="btn" :class="`btn--${variant}`">
    <slot />
  </RouterLink>
  <button
    v-else
    :type="type"
    class="btn"
    :class="`btn--${variant}`"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="btn__spinner rt-spin" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--fw-medium);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast);
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary  { background: var(--primary); color: var(--primary-fg); }
.btn--primary:not(:disabled):hover { background: var(--primary-hover); }
.btn--secondary { background: var(--gray-800); color: var(--white); }
.btn--secondary:not(:disabled):hover { background: var(--gray-700); }
.btn--outline {
  background: var(--white);
  border-color: var(--border);
  color: var(--gray-700);
}
.btn--outline:not(:disabled):hover { background: var(--gray-50); border-color: var(--gray-300); }
.btn--destructive { background: var(--error); color: var(--destructive-fg); }
.btn--destructive:not(:disabled):hover { background: var(--error-hover); }
.btn--link {
  height: auto;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: inherit;
}
.btn--link:not(:disabled):hover { color: var(--primary-hover); text-decoration: underline; }
.btn__spinner {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
}
</style>
