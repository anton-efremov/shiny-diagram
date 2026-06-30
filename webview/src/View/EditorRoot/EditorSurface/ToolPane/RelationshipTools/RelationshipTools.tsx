/**
 * @role [P]
 * @presents Relationship creation tools.
 */

import type { ReactElement } from "react";
import ControlButton from "../../../../ui/ControlButton/ControlButton";
import styles from "./RelationshipTools.module.css";

type ToolPaneItem = {
  readonly icon: string;
  readonly name: string;
};

const relationshipTools: readonly ToolPaneItem[] = [
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

export default function RelationshipTools(): ReactElement {
  return (
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
  );
}
