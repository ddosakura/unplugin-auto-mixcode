import "./App.css";
import reactLogo from "./assets/react.svg";

function Example() {
  const [disabled, setDisabled] = useState(false);
  // const [dialog, open] = usePromisifyDialog(ExampleDialog, {
  //   disabled,
  // });
  const open = useExampleDialog({
    disabled,
  });
  const [name, setName] = useState("");
  const handleClick = async () => {
    const resp = await open({ name });
    resp && setName(resp.name);
  };
  const hello = useHelloWorldDialog();
  return (
    <>
      <span>{name}</span>
      <button onClick={handleClick}>open</button>
      <button onClick={() => setDisabled((disabled) => !disabled)}>
        switch
      </button>
      <button onClick={hello}>hello</button>
      {/** @mixcode dialog */}
    </>
  );
}

function App() {
  const [count, setCount] = useState(0);

  const _open = useExampleDialog();

  return (
    <div className="App color-gray">
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
      {/** @mixcode dialog */}
    </div>
  );
}

export default App;
