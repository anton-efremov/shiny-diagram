import type { ReactElement } from "react";
import type { ClassNodeData } from "../../parsers/classParser";
import styles from "./ClassBox.module.css";

type ClassBoxProps = {
  data: ClassNodeData;
};

/** Renders a single class box node on the React Flow canvas. */
export default function ClassBox({ data }: ClassBoxProps): ReactElement {
  return (
    <div className={styles.classBox}>
      <div className={styles.className}>{data.label}</div>
    </div>
  );
}
