<script setup>
/** Toast area in the top-right corner, just below the header (prototype `ToastProvider`). */
import { useToastStore } from '../../stores/toast'
import AppIcon from './AppIcon.vue'

const store = useToastStore()

const TONE_ICON = {
  success: 'circleCheck',
  error: 'alert',
  info: 'info',
}
</script>

<template>
  <div class="toasts" role="status" aria-live="polite">
    <div v-for="toast in store.toasts" :key="toast.id" class="toast">
      <AppIcon
        :name="TONE_ICON[toast.tone || toast.type] || 'info'"
        :size="18"
        class="toast__icon"
        :class="`toast__icon--${toast.tone || toast.type}`"
      />
      <div class="toast__body">
        <div class="toast__title">{{ toast.title }}</div>
        <div v-if="toast.message || toast.body" class="toast__message">
          {{ toast.message || toast.body }}
        </div>
        <div v-if="toast.meta" class="toast__meta">
          <span class="rt-code">{{ toast.meta }}</span>
        </div>
      </div>
      <button
        type="button"
        class="toast__close"
        aria-label="Đóng thông báo"
        @click="store.dismiss(toast.id)"
      >
        <AppIcon name="x" :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  top: calc(var(--header-h) + 12px);
  right: var(--space-5);
  z-index: 70;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: min(360px, calc(100vw - 32px));
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: var(--space-3) 14px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  pointer-events: auto;
  animation: slide-in 0.2s ease;
}
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
}
.toast__icon {
  margin-top: 1px;
}
.toast__icon--success {
  color: var(--kpi-green);
}
.toast__icon--error {
  color: var(--error);
}
.toast__icon--info {
  color: var(--primary-hover);
}
.toast__body {
  flex: 1;
  min-width: 0;
}
.toast__title {
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--gray-900);
}
.toast__message {
  margin-top: 2px;
  font-size: var(--text-sm);
  line-height: var(--lh-normal);
  color: var(--gray-600);
}
.toast__meta {
  margin-top: 6px;
}
.toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--gray-500);
  cursor: pointer;
}
.toast__close:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}
@media (max-width: 640px) {
  .toasts {
    right: var(--space-4);
  }
}
</style>
