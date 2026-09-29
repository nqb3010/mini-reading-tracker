<script setup>
import { useToastStore } from '../../stores/toast'
const toast = useToastStore()
</script>

<template>
  <div class="viewport" aria-live="polite">
    <div
      v-for="t in toast.toasts"
      :key="t.id"
      class="toast"
      :class="`toast--${t.type}`"
      role="alert"
    >
      <div class="toast__content">
        <p class="toast__title">{{ t.title }}</p>
        <p v-if="t.body" class="toast__body">{{ t.body }}</p>
      </div>
      <button class="toast__close" aria-label="Đóng" @click="toast.dismiss(t.id)">✕</button>
    </div>
  </div>
</template>

<style scoped>
.viewport {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  min-width: 280px;
  max-width: 380px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
  background: var(--white);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  pointer-events: all;
  animation: slide-in 0.2s ease;
}
@keyframes slide-in { from { opacity: 0; transform: translateY(8px); } }
.toast--success { border-color: var(--status-done-fg); }
.toast--info    { border-color: var(--primary); }
.toast--error   { border-color: var(--error); }
.toast__content { flex: 1; min-width: 0; }
.toast__title { margin: 0; font-size: var(--text-sm); font-weight: var(--fw-semibold); color: var(--gray-900); }
.toast__body  { margin: 2px 0 0; font-size: var(--text-sm); color: var(--gray-600); }
.toast__close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  font-size: 11px;
}
.toast__close:hover { color: var(--gray-700); }
</style>
