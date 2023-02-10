import type { Snippet } from "@/core/types";

/** ~mixcode/bootstrap(/\<framework>)? */
export const bootstrap: Snippet = {
  // support to import from .html
  importer: { exclude: [] },

  virtual: {
    suffix: ".tsx",
    load(framework, { unocss, import: importScript }) {
      return `
import "~mixcode";

${typeof unocss === "undefined" ? "" : 'import "uno.css";'}
${typeof importScript === "undefined" ? "" : `import "${importScript}";`}

// TODO: auto choose framework: ${framework}

import React from "react";
import ReactDOM from "react-dom/client";

import App from "/src/App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;
    },
  },
};
