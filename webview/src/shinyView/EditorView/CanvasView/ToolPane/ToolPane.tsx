/**
 * @role [L]+[P] Logic and Presentational
 * @logic Active class placement tool state.
 * @presents Diagram creation tool palette.
 */
import type { ReactElement } from "react";
import ControlButton from "../../../ui/ControlButton/ControlButton";
import { ClassIcon } from "../../../ui/icons/icons";
import { useToolPaneInteractions } from "./useInteractions";
import type { ToolPaneView } from "./views";
import styles from "./ToolPane.module.css";

type ToolPaneProps = {
  readonly view: ToolPaneView;
};

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

/**
 * Renders diagram creation tools.
 */
export default function ToolPane({ view }: ToolPaneProps): ReactElement {
  // @job connect:state:wire
  const { onClassToolClick } = useToolPaneInteractions();

  // @job logic:child:view
  const isClassPlacementActive = view.placementMode === "class";

  // @job render:structure
  return (
    <aside className={styles.toolPane} aria-label="Diagram tools">
      <div className={styles.toolGroup} aria-label="Class elements">
        {classTools.map((tool, index) => {
          // @job logic:child:view
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
