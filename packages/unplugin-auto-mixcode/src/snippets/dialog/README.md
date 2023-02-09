# useXxxDialog

## React

```tsx
function Example() {
  const open = useExampleDialog();
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

## Vue

// TODO: impl vue/useXxxDialog
