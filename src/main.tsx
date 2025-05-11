import React from "react";
import App from "./App";

import { createRoot } from "react-dom/client";

const root_dashboard = document.getElementById("root");
if (root_dashboard) {
  createRoot(root_dashboard as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

const root_spotlight = document.getElementById("root-spotlight");
if (root_spotlight) {
  createRoot(root_spotlight as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
