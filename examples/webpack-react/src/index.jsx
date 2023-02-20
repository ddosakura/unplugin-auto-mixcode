import "~mixcode";

import App from "./App";

import React from "react";
import { Suspense } from "react";

import {
  createHashRouter as createRouter,
  RouterProvider,
} from "react-router-dom";
import routes from "~mixcode/pages";
console.log("[debug routes]", { routes });

import ReactDOM from "react-dom/client";

const router = createRouter(routes);
const Pages = () => (
  <Suspense fallback={<App />}>
    <RouterProvider router={router} />
  </Suspense>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Pages />
  </React.StrictMode>,
);
