export default function DynamicExample() {
  const hello = use$HelloWorldDialog();

  const autoclose = () => {
    hello({ text: "hello, will autoclose after 3s" }, { duration: 3000 });
  };

  const controller = useRef<AbortController>();
  const close = (reason?: string) => controller.current?.abort(reason);
  const open = () => {
    close("reopen dialog");
    controller.current = new AbortController();
    hello({}, { signal: controller.current?.signal });
  };

  return (
    <div>
      <div>hello dialog</div>
      <button onClick={autoclose}>autoclose</button>
      <button onClick={open}>open</button>
      <button onClick={() => close("click close btn")}>close</button>
      {/** @mixcode dialog */}
    </div>
  );
}
