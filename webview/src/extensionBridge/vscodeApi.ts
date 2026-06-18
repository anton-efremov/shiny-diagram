import type { WebviewToHostMessage } from "./protocol";

type VsCodeApi = { postMessage(message: WebviewToHostMessage): void };

declare function acquireVsCodeApi(): VsCodeApi;

export const vscode: VsCodeApi =
  typeof acquireVsCodeApi === "function"
    ? acquireVsCodeApi()
    : { postMessage: () => {} };
