/**
 * @fileoverview ReactFlowConnectionHandlesAdapter render contract.
 * Extracted because ReactFlowConnectionHandlesAdapter is an exclusively owned child component.
 */

export type ConnectionHandleDescriptor = {
  readonly id: string;
  readonly direction: "source" | "target";
  readonly side: "top" | "right" | "bottom" | "left";
};
