import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

import { Teleport, type TeleportProps } from "./teleport";
import type { PropsType } from "./types";

type OmitPromiseProps<P> = Omit<P, "onResolve" | "onReject">;
type ResolveValueType<P> = P extends { onResolve: (value: infer V) => any } ? V
  : unknown;

export interface OpenPromisifyDialogOptions {
  signal: AbortSignal;

  /** auto reject */
  duration: number;
}

export type OpenPromisifyDialog<C> = (
  props: OmitPromiseProps<PropsType<C>>,
  options?: Partial<OpenPromisifyDialogOptions>,
) => Promise<ResolveValueType<PropsType<C>>>;

export class PromisifyDialogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromisifyDialogError";
  }
}

export function usePromisifyDialog<P>(
  Component: ComponentType<P>,
  initialTeleportProps: TeleportProps = {},
) {
  const [impl, setImpl] = useState<ReactNode>();
  const lastContext = useRef<{
    reject: (reason?: any) => void;
    cleanup: () => void;
  }>();
  const open = useCallback((
    props: OmitPromiseProps<P>,
    options: Partial<OpenPromisifyDialogOptions> = {},
  ) => {
    if (impl && lastContext.current) {
      const { reject, cleanup } = lastContext.current;
      reject(new PromisifyDialogError("reopen without close"));
      cleanup();
    }
    const { signal, duration } = options;
    return new Promise<ResolveValueType<P>>((resolve, reject) => {
      const handler = () => handleReject(signal?.reason);
      signal?.addEventListener("abort", handler);
      const timeoutId = duration
        ? setTimeout(
          () =>
            handleReject(
              new PromisifyDialogError(`auto close after ${duration}ms.`),
            ),
          duration,
        )
        : undefined;
      const cleanup = () => {
        signal?.removeEventListener("abort", handler);
        clearTimeout(timeoutId);
      };
      lastContext.current = { reject, cleanup };

      const handleResolve = (value: ResolveValueType<P>) => {
        if (lastContext.current?.reject !== reject) return;
        setImpl(null);
        resolve(value);
        cleanup();
      };
      const handleReject = (reason?: any) => {
        if (lastContext.current?.reject !== reject) return;
        setImpl(null);
        reject(reason);
        cleanup();
      };

      const impl = (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <Component
          {...props}
          onResolve={handleResolve}
          onReject={handleReject}
        />
      );
      setImpl(impl);
    });
  }, [Component, impl]);
  return [
    impl ? <Teleport {...initialTeleportProps}>{impl}</Teleport> : null,
    open,
  ] as const;
}
