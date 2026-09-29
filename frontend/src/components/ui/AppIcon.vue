<script setup>
import { ICONS } from './icons'

defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 16 },
  strokeWidth: { type: Number, default: 1.6 },
})
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <component :is="el.tag" v-for="(el, i) in (ICONS[name] || [])" :key="i" v-bind="el.attrs" />
  </svg>
</template>

<style scoped>
.app-icon {
  flex-shrink: 0;
}
</style>
