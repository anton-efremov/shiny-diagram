import React from "react";
import { createRoot } from "react-dom/client";
import ExtensionBridge from "./extensionBridge/ExtensionBridge";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing root element.");
}

createRoot(root).render(
  <React.StrictMode>
    <ExtensionBridge />
  </React.StrictMode>
);
