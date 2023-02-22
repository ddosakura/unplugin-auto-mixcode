<script setup lang="ts">
const disabled = ref(false)
const open = use$HelloDialog(computed(() => ({
  to: document.body,
  disabled: disabled.value,
})), { name: 'modal' })
const form = reactive({ name: '' })
const handleClick = async () => {
  const resp = await open(form)
  if (!resp) return
  form.name = resp.name
}
</script>

<template>
  <span>{{ form.name }}</span>
  <button @click.stop="handleClick">open</button>
  <button @click.stop="() => disabled = !disabled">switch</button>
<!-- @mixcode dialog --></template>

<style>
.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
