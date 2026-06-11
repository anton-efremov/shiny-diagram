import type { ReactElement } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import type { ClassBoxProps } from "../../../parsers/classDiagram/diagramModel";
import styles from "./ClassBox.module.css";

type ClassBoxNode = Node<ClassBoxProps, "classBox">;

/** Renders a single class box node on the React Flow canvas. */
export default function ClassBox({ data }: NodeProps<ClassBoxNode>): ReactElement {
  const { node, style } = data;

  // classDef colors are user data, not design tokens — the only way to inject
  // dynamic source-derived values into CSS is via custom property overrides.
  const dynamicVars = style
    ? ({
        "--class-fill": style.fill,
        "--class-stroke": style.stroke,
        "--class-color": style.color,
      } as React.CSSProperties)
    : undefined;

  return (
    <div className={styles.classBox} style={dynamicVars}>
      <div className={styles.className}>{node.id}</div>
    </div>
  );
}
