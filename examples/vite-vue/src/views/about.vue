<script setup lang="ts">
const store = useCounterStore()
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="store.increment">{{ store.count }}</button>
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
