/**
 * @role [P]
 * @presents Class element creation tools.
 */

import type { ReactElement } from "react";
import ControlButton from "../../../../ui/ControlButton/ControlButton";
import { ClassIcon } from "../../../../ui/icons/icons";
import styles from "./ClassTools.module.css";

type ClassToolsProps = {
  readonly isClassPlacementActive: boolean;
  readonly onPlacementStart: () => void;
};

type ToolPaneItem = {
  readonly icon: string;
  readonly name: string;
};

const classTools: readonly ToolPaneItem[] = [
  { icon: "[C]", name: "Class" },
  { icon: "<<I>>", name: "Interface" },
  { icon: "<<A>>", name: "Abstract class" },
  { icon: "<<E>>", name: "Enumeration" },
  { icon: "<<S>>", name: "Service" },
  { icon: "<<*>>", name: "Custom annotation" },
  { icon: "[N]", name: "Namespace/group" },
  { icon: "[#]", name: "Note/comment object" },
];

export default function ClassTools({
  isClassPlacementActive,
  onPlacementStart
}: ClassToolsProps): ReactElement {
  return (
    <div className={styles.toolGroup} aria-label="Class elements">
      {classTools.map((tool, index) => {
        const isClassTool = index === 0;
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
            disabled={!isClassTool}
            active={isClassTool && isClassPlacementActive}
            pressed={isClassTool ? isClassPlacementActive : undefined}
            title={tool.name}
            onClick={isClassTool ? onPlacementStart : undefined}
          />
        );
      })}
    </div>
  );
}
