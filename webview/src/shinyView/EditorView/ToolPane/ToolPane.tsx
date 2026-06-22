import type { ReactElement } from "react";
import ControlButton from "../Controls/ControlButton";
import { ClassIcon } from "../Controls/icons";
import type { PlacementMode } from "../placementMode";
import { useToolPaneInteractions } from "./useToolPaneInteractions";
import styles from "./ToolPane.module.css";

type ToolPaneItem = { icon: string; name: string };

const classTools: ToolPaneItem[] = [
  { icon: "[C]", name: "Class" },
  { icon: "<<I>>", name: "Interface" },
  { icon: "<<A>>", name: "Abstract class" },
  { icon: "<<E>>", name: "Enumeration" },
  { icon: "<<S>>", name: "Service" },
  { icon: "<<*>>", name: "Custom annotation" },
  { icon: "[N]", name: "Namespace/group" },
  { icon: "[#]", name: "Note/comment object" },
];

const relationshipTools: ToolPaneItem[] = [
  { icon: "-->", name: "Association" },
  { icon: "--", name: "Solid link" },
  { icon: "..", name: "Dashed link" },
  { icon: "<|--", name: "Inheritance" },
  { icon: "*--", name: "Composition" },
  { icon: "o--", name: "Aggregation" },
  { icon: "..>", name: "Dependency" },
  { icon: "..|>", name: "Realization" },
  { icon: ":label", name: "Labeled relationship" },
  { icon: "1..*", name: "Multiplicity relationship" },
  { icon: "<|>|>", name: "Two-way relationship" },
  { icon: "--()", name: "Lollipop interface" },
];

type ToolPaneProps = {
  placementMode: PlacementMode | null;
  onPlacementModeChange: (placementMode: PlacementMode | null) => void;
};

/**
 * Renders diagram creation tools.
 */
export default function ToolPane({
  placementMode,
  onPlacementModeChange,
}: ToolPaneProps): ReactElement {
  const { onClassToolClick } = useToolPaneInteractions(onPlacementModeChange);
  const isClassPlacementActive = placementMode === "class";

  return (
    <aside className={styles.toolPane} aria-label="Diagram tools">
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
              onClick={isClassTool ? onClassToolClick : undefined}
            />
          );
        })}
      </div>
      <div className={styles.toolGroup} aria-label="Relationship elements">
        {relationshipTools.map((tool) => (
          <ControlButton
            key={tool.name}
            className={styles.toolButton}
            variant="compact"
            icon={
              <span className={styles.toolIcon} aria-hidden="true">
                {tool.icon}
              </span>
            }
            aria-label={tool.name}
            disabled
            title={tool.name}
          />
        ))}
      </div>
    </aside>
  );
}
