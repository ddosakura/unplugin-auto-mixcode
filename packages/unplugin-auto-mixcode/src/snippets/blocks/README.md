# Blocks Snippet

## QuickStart

```ts
import { MIXCODE_BASIC_BLOCK_IDS } from "@/snippets/blocks";

export const snippetXxx: Snippet = {
  virtual: {
    resolveId() {
      return MIXCODE_BASIC_BLOCK_IDS.empty_object;
    },
  },
};
```
