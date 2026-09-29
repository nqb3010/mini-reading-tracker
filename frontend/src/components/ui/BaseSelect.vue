<script setup>
defineProps({ modelValue: String, options: Array })
defineEmits(['update:modelValue'])
</script>

<template>
  <select
    class="select"
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
  </select>
</template>

<style scoped>
.select {
  height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  background: var(--white);
  color: var(--foreground);
  font-size: var(--text-base);
  cursor: pointer;
  outline: none;
  transition: border-color var(--dur-fast);
}
.select:focus { border-color: var(--primary); }
</style>
