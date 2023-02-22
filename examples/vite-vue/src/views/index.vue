<!-- https://github.com/hannoeru/vite-plugin-pages#sfc-custom-block-for-route-data -->
<route lang="json">
{
  "name": "HomePage",
  "meta": {
    "requiresAuth": false
  }
}
</route>

<script setup lang="ts">
const store = useCounterStore()
// ❌ This won't work because it breaks reactivity
// it's the same as destructuring from `props`
// const { count, increment } = store
</script>

<template>
  <main>
    <TheWelcome />
    <button @click="store.increment">{{ store.count }}</button>

    <div>
      <ExampleDialog />
      <ExampleDialog />
    </div>
  </main>
</template>
