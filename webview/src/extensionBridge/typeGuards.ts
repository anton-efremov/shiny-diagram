/**
 * @fileoverview Runtime guards for host messages entering the webview.
 */

import type { HostToWebviewMessage } from "./protocol";

/**
 * Narrows unknown postMessage payloads to host-to-webview messages.
 */
export function isHostMessage(data: unknown): data is HostToWebviewMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    typeof (data as { type: unknown }).type === "string"
  );
}
