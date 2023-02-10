export default function DynamicExample() {
  const hello = useHelloWorldDialog();
  return (
    <div>
      <button onClick={hello}>hello</button>
      {/** @mixcode dialog */}
    </div>
  );
}
