import "./index.css";
import reactLogo from "@/assets/react.svg";
import { Suspense } from "react";

const DynamicExample = lazy(() => import("../modules/dynamic"));

function Example() {
  const [disabled, setDisabled] = useState(false);
  // const [dialog, open] = usePromisifyDialog(ExampleDialog, {
  //   disabled,
  // });
  const open$0 = use$ExampleDialog({
    disabled,
  });
  const [name, setName] = useState("");
  const handleClick = async () => {
    const resp = await open$0({ name });
    resp && setName(resp.name);
  };
  return (
    <>
      <span>{name}</span>
      <button onClick={handleClick}>open</button>
      <button onClick={() => setDisabled((disabled) => !disabled)}>
        switch
      </button>
      {/** @mixcode dialog?0 */}
    </>
  );
}

/**
 * @mixcode foo
 * @mixcode run?js=new+Date%28%29
 */
function App() {
  const [count, setCount] = useState(0);

  // const _open = use$ExampleDialog();
  // const _open$1 = use$ExampleDialog();

  return (
    <div className="App color-gray">
      <div className="flex">
        <span className="i-mdi:react text-size-[144px] color-cyan" />
      </div>
      <div>
        {/** @mixcode run?js=new+Date%28%29 */}
      </div>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Example />
      <Example />
      {count > 5
        ? (
          <Suspense fallback={<span>loading...</span>}>
            <DynamicExample />
          </Suspense>
        )
        : <></>}
      {/** @mixcode dialog?1 */}
      {/** @mixcode dialog */}
      {/** @mixcode dialog?_ */}
      {/** @mixcode dialog?0&1 */}
    </div>
  );
}

export default App;
