<script setup>
/**
 * "+ Add to shelf" button of a search result. While sending, the
 * button is disabled and shows "Adding…"; a book already on the shelf gets an "Added" badge with
 * its status instead.
 */
import { computed } from 'vue'
import { useShelfStore } from '../../stores/shelf'
import { statusLabel } from '../../utils/status'
import AppIcon from '../ui/AppIcon.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  workId: { type: String, required: true },
  title: { type: String, required: true },
  fullWidth: { type: Boolean, default: false },
  initialInShelf: { type: Boolean, default: false },
  initialStatus: { type: String, default: null },
})

const shelf = useShelfStore()
const inShelf = computed(() => props.initialInShelf || shelf.isInShelf(props.workId))
const status = computed(() => shelf.statusOf(props.workId) || props.initialStatus || null)
const adding = computed(() => shelf.isAdding(props.workId))

function add() {
  void shelf.add(props.workId, 'want_to_read', props.title)
}
</script>

<template>
  <div v-if="inShelf" class="added" :class="{ 'added--start': fullWidth }">
    <BaseBadge variant="green">
      <AppIcon name="check" :size="12" :stroke-width="2.4" />
      Đã thêm
    </BaseBadge>
    <span v-if="status" class="added__status">{{ statusLabel(status) }}</span>
  </div>
  <BaseButton
    v-else
    variant="secondary"
    size="sm"
    :full-width="fullWidth"
    :loading="adding"
    :aria-label="`Thêm ${title} vào tủ`"
    @click.stop="add"
  >
    <AppIcon name="plus" :size="14" :stroke-width="2" />
    {{ adding ? 'Đang thêm…' : 'Thêm vào tủ' }}
  </BaseButton>
</template>

<style scoped>
.added {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 32px;
}
.added--start {
  justify-content: flex-start;
}
.added__status {
  font-size: 11px;
  color: var(--gray-500);
}
</style>
