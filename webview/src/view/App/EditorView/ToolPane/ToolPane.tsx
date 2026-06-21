import type { ReactElement } from "react";
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

/**
 * Renders currently disabled diagram creation tools.
 */
export default function ToolPane(): ReactElement {
  return (
    <aside className={styles.toolPane} aria-label="Diagram tools">
      <div className={styles.toolGroup} aria-label="Class elements">
        {classTools.map((tool) => (
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
