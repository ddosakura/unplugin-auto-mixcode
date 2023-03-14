import type { JSX } from "./intrinsic";

export type FC<Props = {}> = (props: Props) => HTMLElement | HTMLElement[];

export const Fragment: FC<{ children?: any }> = (props) => {
  if (!props.children) return [];
  return props.children;
};

export const jsxs = (
  type: FC | keyof JSX.IntrinsicElements,
  rawProps: any,
  _key: string,
): ReturnType<FC> => {
  if (typeof type !== "string") {
    return type(rawProps);
  }
  const { children = [], ...props } = rawProps ?? {};
  const el = document.createElement(type);
  Object.entries(props).forEach(([k, v]) => el[k as "id"] = v as string);
  const list = Array.isArray(children) ? children.flat(Infinity) : [children];
  el.append(...list);
  return el;
};
