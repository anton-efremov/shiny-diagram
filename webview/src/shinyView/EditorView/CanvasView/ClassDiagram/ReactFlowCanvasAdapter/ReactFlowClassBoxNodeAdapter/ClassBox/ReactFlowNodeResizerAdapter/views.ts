/**
 * @fileoverview ReactFlowNodeResizerAdapter render contract.
 * Extracted because ReactFlowNodeResizerAdapter is an exclusively owned child component.
 */

export type ReactFlowNodeResizerAdapterView = {
  readonly nodeId: string;
  readonly isVisible: boolean;
  readonly minWidth: number;
  readonly minHeight: number;
  readonly handleClassName: string;
  readonly lineClassName: string;
};
