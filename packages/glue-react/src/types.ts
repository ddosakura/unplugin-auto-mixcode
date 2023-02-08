import type { ComponentType } from "react";

export type PropsType<C> = C extends ComponentType<infer P> ? P : unknown;
