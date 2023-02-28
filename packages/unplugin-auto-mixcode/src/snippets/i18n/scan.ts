import { slash } from "@antfu/utils";
import fg from "fast-glob";
import { join } from "node:path";

export function getLocales(path: string): string[] {
  return fg
    .sync(`**/*.json`, {
      cwd: path,
      onlyFiles: true,
    })
    .map((p) => slash(join(path, p)));
}
