import type { ReactElement } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { ClassBoxView } from "../../../controller";
import MemberTable from "./MemberTable/MemberTable";
import styles from "./ClassBox.module.css";

type ClassBoxNode = Node<ClassBoxView, "classBox">;

const CONNECTION_HANDLES: ReadonlyArray<{
  id: string;
  type: "source" | "target";
  position: Position;
}> = [
  { id: "top", type: "source", position: Position.Top },
  { id: "right", type: "source", position: Position.Right },
  { id: "bottom", type: "source", position: Position.Bottom },
  { id: "left", type: "source", position: Position.Left },
  { id: "target-top", type: "target", position: Position.Top },
  { id: "target-right", type: "target", position: Position.Right },
  { id: "target-bottom", type: "target", position: Position.Bottom },
  { id: "target-left", type: "target", position: Position.Left },
];

const resizeHandles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

export default function ClassBox({ data, selected }: NodeProps<ClassBoxNode>): ReactElement {
  const fields = data.members.filter((m) => m.kind === "field");
  const methods = data.members.filter((m) => m.kind === "method");

  const dynamicVars = data.style
    ? ({
        "--class-fill": data.style.fill,
        "--class-stroke": data.style.stroke,
        "--class-color": data.style.color,
      } as React.CSSProperties)
    : undefined;

  return (
    <div
      className={`${styles.classBox} ${selected ? styles.selected : ""}`}
      style={dynamicVars}
      title={data.classId}
    >
      {CONNECTION_HANDLES.map(({ id, type, position }) => (
        <Handle
          key={id}
          className={styles.connectionHandle}
          id={id}
          type={type}
          position={position}
          isConnectable={false}
        />
      ))}
      <header className={styles.header}>
        {data.header.stereotype ? (
          <div className={styles.stereotype} title={data.header.stereotype}>
            &lt;&lt;{data.header.stereotype}&gt;&gt;
          </div>
        ) : null}
        <div className={styles.className} title={data.header.label}>
          {data.header.label}
        </div>
      </header>
      <MemberTable fields={fields} methods={methods} />
      {selected
        ? resizeHandles.map((handle) => (
            <span
              key={handle}
              className={`${styles.resizeHandle} ${styles[handle]}`}
              aria-hidden="true"
            />
          ))
        : null}
    </div>
  );
}
