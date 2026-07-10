/**
 * @behavior Diagram node placement tool button state and event routing.
 * @render Diagram node creation tools.
 */

import type { ReactElement } from "react";
import ToggleButton from "../../../../ui/primitives/ToggleButton/ToggleButton";
import { ClassGlyph, NamespaceGlyph, NoteGlyph } from "./icons";

type NodePlacementToolsProps = {
  readonly kind: "class" | "note" | "namespace";
  readonly isClassPlacementActive: boolean;
  readonly isNotePlacementActive: boolean;
  readonly isNamespacePlacementActive: boolean;
  readonly onClassPlacementStart: () => void;
  readonly onNotePlacementStart: () => void;
  readonly onNamespacePlacementStart: () => void;
};

type ToolPaneItem = {
  readonly icon: () => ReactElement;
  readonly name: string;
  readonly kind: "class" | "note" | "namespace";
};

const nodeTools: readonly ToolPaneItem[] = [
  { icon: ClassGlyph, name: "Class", kind: "class" },
  { icon: NamespaceGlyph, name: "Namespace", kind: "namespace" },
  { icon: NoteGlyph, name: "Note", kind: "note" },
];

export default function NodePlacementTools({
  kind,
  isClassPlacementActive,
  isNotePlacementActive,
  isNamespacePlacementActive,
  onClassPlacementStart,
  onNotePlacementStart,
  onNamespacePlacementStart,
}: NodePlacementToolsProps): ReactElement {
  const tool = nodeTools.find((candidate) => candidate.kind === kind) ?? nodeTools[0];
  const isClassTool = tool.kind === "class";
  const isNoteTool = tool.kind === "note";
  const isNamespaceTool = tool.kind === "namespace";
  const isPressed =
    (isClassTool && isClassPlacementActive) ||
    (isNoteTool && isNotePlacementActive) ||
    (isNamespaceTool && isNamespacePlacementActive);
  const onClick = isClassTool
    ? onClassPlacementStart
    : isNoteTool
      ? onNotePlacementStart
      : onNamespacePlacementStart;
  const Icon = tool.icon;

  return <ToggleButton icon={<Icon />} pressed={isPressed} title={tool.name} onClick={onClick} />;
}
