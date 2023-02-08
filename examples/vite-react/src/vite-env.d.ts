/// <reference types="vite/client" />

declare module "~mixcode/useExampleDialog" {
  import { OpenPromisifyDialog, TeleportProps } from "@mixcode/glue-react";
  export default function (
    teleportProps?: TeleportProps,
  ): OpenPromisifyDialog<typeof ExampleDialog>;
}
