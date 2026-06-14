/**
 * @fileoverview Acquires the VS Code webview API instance, with a no-op fallback
 * for local Vite development outside the extension host.
 */

import type { WebviewToHostMessage } from "./protocol";

type VsCodeApi = {
  postMessage(message: WebviewToHostMessage): void;
};

declare function acquireVsCodeApi(): VsCodeApi;

/** VS Code webview API instance. Posts messages to the extension host. */
export const vscode: VsCodeApi =
  typeof acquireVsCodeApi === "function"
    ? acquireVsCodeApi()
    : {
        postMessage: () => {
          // Browser fallback for local Vite development.
        },
      };
