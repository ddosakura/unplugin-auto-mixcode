export const HelloWorldDialog: React.FC<{ text?: string }> = (
  { text = "Hello World!" },
) => {
  return (
    <div>
      <span>{text}</span>
    </div>
  );
};

export const ExampleDialog: React.FC<{
  name: string;
  onResolve: (value?: { name: string }) => void;
  onReject: (value: unknown) => void;
}> = ({ name: initialName, onResolve, onReject }) => {
  const [name, setName] = useState(initialName);
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => onResolve({ name })}>submit</button>
      <button onClick={() => onResolve()}>cancel</button>
      <button onClick={() => onReject("err: reject")}>reject</button>
    </div>
  );
};

/*
import type { OpenPromisifyDialog } from "@mixcode/glue-react";

export function withExampleDialog<P>(
  Component: React.ComponentType<
    P & { openExampleDialog: OpenPromisifyDialog<typeof ExampleDialog> }
  >,
  teleportProps?: TeleportProps,
): React.FC<P> {
  return (props) => {
    const [dialog, openExampleDialog] = usePromisifyDialog(
      ExampleDialog,
      teleportProps,
    );
    return (
      <>
        <Component {...props} openExampleDialog={openExampleDialog} />
        {dialog}
      </>
    );
  };
}
*/
