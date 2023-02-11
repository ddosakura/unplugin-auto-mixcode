export default function DynamicExample() {
  const hello = use$HelloWorldDialog();
  return (
    <div>
      <button onClick={hello}>hello</button>
      {/** @mixcode dialog */}
    </div>
  );
}
