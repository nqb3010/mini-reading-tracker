<script setup>
/** Pill badge based on W3 `Badge.jsx` (12px, bold, fully rounded). */
defineProps({
  variant: {
    type: String,
    default: 'default',
  },
})
</script>

<template>
  <span class="badge" :class="`badge--${variant}`"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--fw-semibold);
  line-height: 1.4;
  white-space: nowrap;
}
.badge--default {
  background: var(--primary);
  color: var(--white);
}
.badge--secondary {
  background: var(--muted);
  color: var(--slate-900);
}
.badge--outline {
  background: transparent;
  color: var(--foreground);
  border-color: var(--border);
}
.badge--blue {
  background: var(--buyer-badge-bg);
  color: var(--buyer-badge-fg);
}
.badge--green {
  background: var(--supplier-badge-bg);
  color: var(--supplier-badge-fg);
}
.badge--amber {
  background: var(--prog-amber-bg);
  color: var(--prog-amber-fg);
}
.badge--red {
  background: var(--prog-red-bg);
  color: var(--prog-red-fg);
}
.badge--neutral {
  background: var(--gray-100);
  color: var(--gray-700);
}
</style>
