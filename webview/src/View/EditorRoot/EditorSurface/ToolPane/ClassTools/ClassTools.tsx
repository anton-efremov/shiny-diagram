/**
 * @behavior Class and note placement tool button state and event routing.
 * @render Class element creation tools.
 */

import type { ReactElement } from "react";
import ControlButton from "../../../../ui/ControlButton/ControlButton";
import { ClassIcon } from "../../../../ui/icons/icons";
import styles from "./ClassTools.module.css";

type ClassToolsProps = {
  readonly isClassPlacementActive: boolean;
  readonly isNotePlacementActive: boolean;
  readonly onPlacementStart: () => void;
  readonly onNotePlacementStart: () => void;
};

type ToolPaneItem = {
  readonly icon: string;
  readonly name: string;
  readonly kind: "class" | "note" | "disabled";
};

const classTools: readonly ToolPaneItem[] = [
  { icon: "[C]", name: "Class", kind: "class" },
  { icon: "<<I>>", name: "Interface", kind: "disabled" },
  { icon: "<<A>>", name: "Abstract class", kind: "disabled" },
  { icon: "<<E>>", name: "Enumeration", kind: "disabled" },
  { icon: "<<S>>", name: "Service", kind: "disabled" },
  { icon: "<<*>>", name: "Custom annotation", kind: "disabled" },
  { icon: "[N]", name: "Namespace/group", kind: "disabled" },
  { icon: "[#]", name: "Note/comment object", kind: "note" },
];

export default function ClassTools({
  isClassPlacementActive,
  isNotePlacementActive,
  onPlacementStart,
  onNotePlacementStart,
}: ClassToolsProps): ReactElement {
  return (
    <div className={styles.toolGroup} aria-label="Class elements">
      {classTools.map((tool) => {
        const isClassTool = tool.kind === "class";
        const isNoteTool = tool.kind === "note";
        return (
          <ControlButton
            key={tool.name}
            className={styles.toolButton}
            variant="compact"
            icon={
              isClassTool ? (
                <ClassIcon />
              ) : (
                <span className={styles.toolIcon} aria-hidden="true">
                  {tool.icon}
                </span>
              )
            }
            aria-label={tool.name}
            disabled={!isClassTool && !isNoteTool}
            active={
              (isClassTool && isClassPlacementActive) || (isNoteTool && isNotePlacementActive)
            }
            pressed={
              isClassTool ? isClassPlacementActive : isNoteTool ? isNotePlacementActive : undefined
            }
            title={tool.name}
            onClick={isClassTool ? onPlacementStart : isNoteTool ? onNotePlacementStart : undefined}
          />
        );
      })}
    </div>
  );
}
