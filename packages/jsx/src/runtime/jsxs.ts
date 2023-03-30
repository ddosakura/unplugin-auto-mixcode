import type { JSX } from "./intrinsic";

// eslint-disable-next-line @typescript-eslint/ban-types
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
  const { children = [], style = {}, ...props } = rawProps ?? {};
  const el = document.createElement(type);
  Object.entries(props)
    .forEach(([k, v]) => el[k as "id"] = v as string);
  Object.entries(style)
    .forEach(([k, v]) => el.style[k as "color"] = v as string);
  const list = Array.isArray(children) ? children.flat(Infinity) : [children];
  el.append(...list);
  return el;
};
