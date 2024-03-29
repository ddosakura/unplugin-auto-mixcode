type MixNode<T extends HTMLElement> = Partial<Omit<T, "children" | "style">> & {
  children?: any;
  style?: Partial<T["style"]>;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
  export interface IntrinsicElements {
    // TODO: HTMLElementTagNameMap
    div: MixNode<HTMLDivElement>;
    span: MixNode<HTMLSpanElement>;
    p: MixNode<HTMLParagraphElement>;
    h1: MixNode<HTMLHeadElement>;
    h2: MixNode<HTMLHeadElement>;
    h3: MixNode<HTMLHeadElement>;
    h4: MixNode<HTMLHeadElement>;
    h5: MixNode<HTMLHeadElement>;
    h6: MixNode<HTMLHeadElement>;
    a: MixNode<HTMLAnchorElement>;
    img: MixNode<HTMLImageElement>;
    button: MixNode<HTMLButtonElement>;
  }
}
