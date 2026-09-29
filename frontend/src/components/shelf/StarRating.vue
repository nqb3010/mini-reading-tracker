<script setup>
import { ref } from 'vue'

defineProps({ modelValue: { type: Number, default: null } })
const emit = defineEmits(['update:modelValue'])

function set(value) { emit('update:modelValue', value) }
</script>

<template>
  <div class="stars" role="group" aria-label="Đánh giá">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      class="star"
      :class="{ 'star--filled': n <= (modelValue ?? 0) }"
      :aria-label="`${n} sao`"
      @click="set(n === modelValue ? null : n)"
    >★</button>
  </div>
</template>

<style scoped>
.stars { display: flex; gap: 2px; }
.star {
  border: none;
  background: transparent;
  color: var(--gray-300);
  font-size: 18px;
  cursor: pointer;
  transition: color var(--dur-fast);
  padding: 0;
  line-height: 1;
}
.star:hover, .star--filled { color: var(--warn-amber); }
</style>
