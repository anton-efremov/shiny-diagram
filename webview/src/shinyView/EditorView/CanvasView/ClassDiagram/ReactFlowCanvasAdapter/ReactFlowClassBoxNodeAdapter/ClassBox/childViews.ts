/**
 * @fileoverview ClassBox direct-child view derivation.
 */

import type { MemberTableView } from "./MemberTable/views";
import type { ReactFlowConnectionHandlesAdapterView } from "./ReactFlowConnectionHandlesAdapter/views";
import type { ReactFlowNodeResizerAdapterView } from "./ReactFlowNodeResizerAdapter/views";
import type { ClassBoxView } from "./views";

const CONNECTION_HANDLES: ReactFlowConnectionHandlesAdapterView["handles"] = [
  { id: "top", direction: "source", side: "top" },
  { id: "right", direction: "source", side: "right" },
  { id: "bottom", direction: "source", side: "bottom" },
  { id: "left", direction: "source", side: "left" },
  { id: "target-top", direction: "target", side: "top" },
  { id: "target-right", direction: "target", side: "right" },
  { id: "target-bottom", direction: "target", side: "bottom" },
  { id: "target-left", direction: "target", side: "left" },
];

// @job logic:child:view
export function toReactFlowNodeResizerAdapterView({
  view,
  handleClassName,
  lineClassName,
}: {
  readonly view: ClassBoxView;
  readonly handleClassName: string;
  readonly lineClassName: string;
}): ReactFlowNodeResizerAdapterView {
  return {
    nodeId: view.classId,
    isVisible: view.isResizeVisible,
    minWidth: 80,
    minHeight: 48,
    handleClassName,
    lineClassName,
  };
}

// @job logic:child:view
export function toReactFlowConnectionHandlesAdapterView({
  className,
}: {
  readonly className: string;
}): ReactFlowConnectionHandlesAdapterView {
  return {
    handles: CONNECTION_HANDLES,
    className,
  };
}

// @job logic:child:view
export function toMemberTableView(view: ClassBoxView): MemberTableView {
  return {
    fields: view.members.filter((member) => member.kind === "field"),
    methods: view.members.filter((member) => member.kind === "method"),
    isSelected: view.isSelected,
  };
}
