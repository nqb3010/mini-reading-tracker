<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({ width: { type: Number, default: 640 } })
const emit = defineEmits(['close'])

function onKey(e) { if (e.key === 'Escape') emit('close') }
onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal" :style="{ maxWidth: `${width}px` }" role="dialog" aria-modal="true">
      <div class="modal__head">
        <div class="modal__title"><slot name="title" /></div>
        <button class="modal__close" aria-label="Đóng" @click="emit('close')">✕</button>
      </div>
      <div class="modal__body"><slot /></div>
      <div v-if="$slots.footer" class="modal__foot"><slot name="footer" /></div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
}
.modal {
  width: 100%;
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  overflow: hidden;
  max-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}
.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.modal__title { font-size: var(--text-md); font-weight: var(--fw-semibold); color: var(--gray-900); }
.modal__close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--gray-500);
  cursor: pointer;
  font-size: 14px;
  transition: background var(--dur-fast);
}
.modal__close:hover { background: var(--gray-100); color: var(--gray-900); }
.modal__body { flex: 1; overflow-y: auto; padding: var(--space-5); }
.modal__foot {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
</style>
