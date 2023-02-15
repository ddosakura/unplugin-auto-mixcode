import type { FSWatcher } from "node:fs";

import { type Awaitable, slash } from "@antfu/utils";
import chokidar from "chokidar";
import minimatch from "minimatch";
import type { HMRPayload } from "vite";

export function matchGlobs(filepath: string, globs: string[]) {
  for (const glob of globs) {
    if (minimatch(slash(filepath), glob)) return true;
  }
  return false;
}

export interface WatcherOptions {
  rawGlobs?: string | string[];
  match?: (path: string) => Awaitable<boolean>;
  onUpdate?(
    path: string,
    type: "unlink" | "add" | "change",
  ): Awaitable<
    | {
        hmrPayload?: HMRPayload;
        invalidateModules?: string[];
      }
    | undefined
  >;
}

export class Watcher {
  constructor(public readonly options: WatcherOptions) {}

  get globs() {
    const { rawGlobs = [] } = this.options;
    return typeof rawGlobs === "string" ? [rawGlobs] : rawGlobs;
  }

  #match(path: string) {
    const { globs } = this;
    const { match } = this.options;
    if (match) return match(path);
    return matchGlobs(path, globs);
  }

  setup(
    emitUpdate?: (
      this: Watcher,
      path: string,
      type: "unlink" | "add" | "change",
    ) => void,
    watcher: FSWatcher = chokidar.watch(this.globs),
  ) {
    watcher.on("unlink", async (path) => {
      path = slash(path);
      if (!this.#match(path)) return;
      emitUpdate?.call(this, path, "unlink");
    });

    watcher.on("add", async (path) => {
      path = slash(path);
      if (!this.#match(path)) return;
      emitUpdate?.call(this, path, "add");
    });

    watcher.on("change", async (path) => {
      path = slash(path);
      if (!this.#match(path)) return;
      emitUpdate?.call(this, path, "change");
    });
  }
}
