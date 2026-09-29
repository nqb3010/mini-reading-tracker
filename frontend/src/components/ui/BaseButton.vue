<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'default' },
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
})
const emit = defineEmits(['click'])

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  { 'btn--full': props.fullWidth },
])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <slot />
  </RouterLink>
  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
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
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition:
    background var(--dur-base),
    color var(--dur-base),
    border-color var(--dur-base);
}
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn--default {
  height: 36px;
  padding: 0 16px;
}
.btn--sm {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}
.btn--lg {
  height: 44px;
  padding: 0 32px;
}
.btn--full {
  width: 100%;
}

.btn--primary {
  background: var(--primary);
  color: var(--white);
  border-color: var(--primary);
  font-weight: var(--fw-semibold);
}
.btn--primary:not(:disabled):hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn--secondary {
  background: var(--white);
  color: var(--primary);
  border-color: var(--primary);
  font-weight: var(--fw-medium);
}
.btn--secondary:not(:disabled):hover {
  background: var(--primary-soft);
  color: var(--primary-hover);
}

.btn--outline {
  background: var(--white);
  color: var(--gray-500);
  border-color: var(--gray-300);
  font-weight: var(--fw-medium);
}
.btn--outline:not(:disabled):hover {
  background: var(--gray-50);
  color: var(--gray-700);
  border-color: var(--gray-400);
}

.btn--ghost {
  background: transparent;
  color: var(--primary-hover);
  font-weight: var(--fw-medium);
}
.btn--ghost:not(:disabled):hover {
  color: var(--primary);
}

.btn--destructive,
.btn--error {
  background: var(--error);
  color: var(--white);
  border-color: var(--error);
  font-weight: var(--fw-semibold);
}
.btn--destructive:not(:disabled):hover,
.btn--error:not(:disabled):hover {
  background: var(--error-hover);
  border-color: var(--error-hover);
}

.btn.btn--link {
  height: auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: var(--primary);
  font-weight: var(--fw-medium);
}
.btn.btn--link:not(:disabled):hover {
  text-decoration: underline;
}

.btn__spinner {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
}
</style>
