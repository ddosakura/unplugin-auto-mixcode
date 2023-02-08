import { type FC, type ReactNode, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

export interface TeleportProps {
  to?: string | HTMLElement;
  disabled?: boolean;
}

export const Teleport: FC<TeleportProps & { children: ReactNode }> = ({
  to = document.body,
  disabled,
  children,
}) => {
  const root = typeof to === "string" ? document.getElementById(to) : to;
  const el = useMemo(() => document.createElement("div"), []);
  useEffect(() => {
    if (!root) {
      console.warn("[Teleport]", `Element "${to}" not found in document`);
      return;
    }
    root.appendChild(el);
    return () => {
      root.removeChild(el);
    };
  }, [root, el]);
  return disabled ? <>{children}</> : createPortal(children, el);
};
