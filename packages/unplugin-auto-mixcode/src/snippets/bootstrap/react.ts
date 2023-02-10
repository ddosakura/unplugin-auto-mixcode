import type { Snippet } from "@/core/types";

export default <Snippet>{
  // support to import from .html
  importer: { exclude: [] },

  virtual: {
    suffix: ".tsx",
    load(id) {
      return `
import "~mixcode";

import "/src/index.css";
import "uno.css";

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
