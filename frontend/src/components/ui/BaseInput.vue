<script setup>
defineProps({ modelValue: String, placeholder: String, maxlength: Number })
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    class="input"
    :value="modelValue"
    :placeholder="placeholder"
    :maxlength="maxlength"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<style scoped>
.input {
  display: block;
  width: 100%;
  height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  background: var(--white);
  color: var(--foreground);
  font-size: var(--text-base);
  transition: border-color var(--dur-fast);
  outline: none;
}
.input::placeholder { color: var(--gray-400); }
.input:focus { border-color: var(--primary); }
</style>
