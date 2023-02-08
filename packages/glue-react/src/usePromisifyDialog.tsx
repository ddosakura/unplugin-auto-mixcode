import { type ComponentType, type ReactNode, useState } from "react";

import { Teleport, type TeleportProps } from "./teleport";
import type { PropsType } from "./types";

type OmitPromiseProps<P> = Omit<P, "onResolve" | "onReject">;
// rome-ignore lint/suspicious/noExplicitAny: <explanation>
type ResolveValueType<P> = P extends { onResolve: (value: infer V) => any } ? V
  : unknown;

export type OpenPromisifyDialog<C> = (
  props: OmitPromiseProps<PropsType<C>>,
) => Promise<ResolveValueType<PropsType<C>>>;

export function usePromisifyDialog<P>(
  Component: ComponentType<P>,
  initialTeleportProps: TeleportProps = {},
) {
  const [impl, setImpl] = useState<ReactNode>();
  const open = (props: OmitPromiseProps<P>) =>
    new Promise<ResolveValueType<P>>((resolve, reject) => {
      const impl = (
        // @ts-ignore
        <Component
          {...props}
          onResolve={(value: ResolveValueType<P>) => {
            setImpl(null);
            resolve(value);
          }}
          // rome-ignore lint/suspicious/noExplicitAny: <explanation>
          onReject={(reason?: any) => {
            setImpl(null);
            reject(reason);
          }}
        />
      );
      setImpl(impl);
    });
  return [
    impl ? <Teleport {...initialTeleportProps}>{impl}</Teleport> : null,
    open,
  ] as const;
}
