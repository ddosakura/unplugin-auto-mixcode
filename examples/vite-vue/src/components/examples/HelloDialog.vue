<script setup lang="ts">
interface Props {
  name: string
}

const props = defineProps<Props>()
const name = ref(props.name)

const emit = defineEmits<{
  (e: 'resolve', value?: Props): void
  (e: 'reject', err: string): void
}>()
</script>

<template>
  <div class="modal-container">
    <input v-model="name" />
    <button @click.stop="emit('resolve', { name })">submit</button>
    <button @click.stop="emit('resolve')">cancel</button>
    <button @click.stop="emit('reject', 'err: reject')">reject</button>
  </div>
</template>

<style scoped>
.modal-container {
  width: 300px;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}
</style>
