import type { FSWatcher } from "node:fs";

import { type Awaitable, slash } from "@antfu/utils";
import chokidar from "chokidar";
import minimatch from "minimatch";
import type { HMRPayload, ViteDevServer } from "vite";

export function matchGlobs(filepath: string, globs: string[]) {
  for (const glob of globs) {
    if (minimatch(slash(filepath), glob)) return true;
  }
  return false;
}

export interface Resource {
  add(paths: string): Promise<void>;
  del(paths: string): Promise<void>;
}

export interface WatcherOptions {
  resource: Resource;
  rawGlobs?: string | string[];
  match?: (path: string) => boolean;
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
      if (!this.#match(path)) return;

      path = slash(path);
      await this.options.resource.del(path);
      emitUpdate?.call(this, path, "unlink");
    });

    watcher.on("add", async (path) => {
      if (!this.#match(path)) return;

      path = slash(path);
      await this.options.resource.add(path);
      emitUpdate?.call(this, path, "add");
    });

    watcher.on("change", async (path) => {
      if (!this.#match(path)) return;
      emitUpdate?.call(this, path, "change");
    });
  }
}
