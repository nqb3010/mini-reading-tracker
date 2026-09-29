<script setup>
import { coverUrl } from '../../api/books'

const props = defineProps({
  coverId: { type: Number, default: null },
  title: { type: String, required: true },
  size: { type: String, default: 'M' },
  radius: { type: String, default: '4px' },
})

const src = props.coverId ? coverUrl(props.coverId, props.size) : null
</script>

<template>
  <div class="cover" :style="{ borderRadius: radius }">
    <img v-if="src" :src="src" :alt="title" class="cover__img" loading="lazy" />
    <div v-else class="cover__placeholder" :style="{ borderRadius: radius }">
      <span class="cover__abbr">{{ title.slice(0, 2).toUpperCase() }}</span>
    </div>
  </div>
</template>

<style scoped>
.cover { overflow: hidden; background: var(--gray-100); }
.cover__img { display: block; width: 100%; height: 100%; object-fit: cover; }
.cover__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--gray-200);
}
.cover__abbr {
  font-size: var(--text-sm);
  font-weight: var(--fw-bold);
  color: var(--gray-500);
  letter-spacing: 0.04em;
}
</style>
