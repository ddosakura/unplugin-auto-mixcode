<script setup lang="ts">
const store = useCounterStore()
const { count } = storeToRefs(store)
const { increment } = store
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="increment">{{ count }}</button>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
