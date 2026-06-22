import type { ReactElement } from "react";
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
            <button
              key={tool.name}
              className={[
                styles.toolButton,
                isClassTool ? styles.enabledToolButton : "",
                isClassTool && isClassPlacementActive ? styles.activeToolButton : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="button"
              aria-disabled={isClassTool ? undefined : "true"}
              aria-pressed={isClassTool ? isClassPlacementActive : undefined}
              tabIndex={isClassTool ? 0 : -1}
              title={tool.name}
              onClick={isClassTool ? onClassToolClick : undefined}
            >
              <span className={styles.toolIcon} aria-hidden="true">
                {tool.icon}
              </span>
            </button>
          );
        })}
      </div>
      <div className={styles.toolGroup} aria-label="Relationship elements">
        {relationshipTools.map((tool) => (
          <button
            key={tool.name}
            className={styles.toolButton}
            type="button"
            aria-disabled="true"
            tabIndex={-1}
            title={tool.name}
          >
            <span className={styles.toolIcon} aria-hidden="true">
              {tool.icon}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
