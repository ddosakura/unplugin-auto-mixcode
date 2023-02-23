import type { SnippetDefinition } from "@/core/types";
import { PREFIX_MIXCODE_VIRTUAL_MODULE } from "@/core/utils";

const MIXCODE_BASIC_BLOCKS = {
  empty_object: "export default {};",
} satisfies Record<string, string>;

export const MIXCODE_BASIC_BLOCK_IDS = Object.fromEntries(
  Object.keys(MIXCODE_BASIC_BLOCKS).map(
    (id) => [id, `${PREFIX_MIXCODE_VIRTUAL_MODULE}blocks/${id}.ts`] as const,
  ),
) as unknown as Record<keyof typeof MIXCODE_BASIC_BLOCKS, string>;

export const snippetBlocks: SnippetDefinition = {
  virtual: {
    modules: {
      ...MIXCODE_BASIC_BLOCKS,
      default: MIXCODE_BASIC_BLOCKS.empty_object,
    },
  },
};
