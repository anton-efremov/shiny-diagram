/**
 * @fileoverview Runtime type guards for the Shiny webview.
 * Centralizes all type narrowing functions for unknown or unverified data.
 */

import type { HostToWebviewMessage } from "../protocol";

/**
 * Validates that an unknown postMessage payload is a HostMessage.
 * Use before accessing any message fields to avoid runtime errors
 * from malformed or unexpected messages crossing the window boundary.
 *
 * @param data - Raw event.data from a MessageEvent.
 * @returns True if data is a valid HostMessage, narrowing its type.
 */
export function isHostMessage(data: unknown): data is HostToWebviewMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    typeof (data as { type: unknown }).type === "string"
  );
}
