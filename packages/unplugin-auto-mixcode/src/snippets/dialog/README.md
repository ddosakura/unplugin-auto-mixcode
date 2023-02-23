# Dialog Snippet

Inspired by:

- https://juejin.cn/post/7182393187917365305
- https://www.zhihu.com/question/35820643/answer/64646527
- https://www.zhihu.com/question/35820643/answer/2286114480

## QuickStart

### React

```tsx
function Example() {
  const open = use$ExampleDialog();
  const handleClick = async () => {
    const result = await open({ ... });
    // ...
  };
  return (
    <>
      <button onClick={handleClick}>open</button>
      {/** @mixcode dialog */}
    </>
  );
}
```

#### With Scope

```tsx
function Example() {
  const open$0 = use$ExampleDialog();
  const handleClick = async () => {
    const result = await open$0({ ... });
    // ...
  };
  return (
    <>
      <button onClick={handleClick}>open</button>
      {/** @mixcode dialog?0 */}
    </>
  );
}
```

### Vue

```vue
<script setup lang="ts">
const open = use$ExampleDialog()
const handleClick = async () => {
  const result = await open({ ... });
}
</script>

<template>
  <button @click.stop="handleClick">open</button>
  <!-- @mixcode dialog -->
</template>
```
