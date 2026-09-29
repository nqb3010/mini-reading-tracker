<script setup>
/**
 * Cover through the `/api/covers/{coverId}?size=` proxy. With no cover,
 * or if it fails to load, a "No cover yet" placeholder is shown.
 */
import { computed, ref, watch } from 'vue'
import { coverUrl } from '../../api/books'
import AppIcon from '../ui/AppIcon.vue'

const props = defineProps({
  coverId: { type: Number, default: null },
  title: { type: String, required: true },
  size: { type: String, default: 'M' },
  /** CSS sizes, e.g. `100%`, `36px`. Without `height`, the 2:3 aspect ratio is kept. */
  width: { type: String, default: '100%' },
  height: { type: String, default: undefined },
  radius: { type: String, default: '0' },
  iconSize: { type: Number, default: 28 },
})

const failed = ref(false)
watch(
  () => props.coverId,
  () => {
    failed.value = false
  },
)

const src = computed(() => (props.coverId === null ? null : coverUrl(props.coverId, props.size)))
const boxStyle = computed(() => ({
  width: props.width,
  height: props.height,
  aspectRatio: props.height ? undefined : '2 / 3',
  borderRadius: props.radius,
}))
</script>

<template>
  <img
    v-if="src && !failed"
    class="cover"
    :src="src"
    :alt="`Bìa sách ${title}`"
    loading="lazy"
    decoding="async"
    :style="boxStyle"
    @error="failed = true"
  />
  <div
    v-else
    class="cover cover--empty"
    role="img"
    :aria-label="`Chưa có ảnh bìa: ${title}`"
    :style="boxStyle"
  >
    <AppIcon name="bookOpen" :size="iconSize" :stroke-width="1.4" />
    <span v-if="iconSize >= 24" class="cover__text">Chưa có ảnh bìa</span>
  </div>
</template>

<style scoped>
.cover {
  display: block;
  flex-shrink: 0;
  overflow: hidden;
  object-fit: cover;
  background: var(--slate-100);
}
.cover--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--slate-400);
}
.cover__text {
  font-size: 11px;
  color: var(--slate-500);
}
</style>
