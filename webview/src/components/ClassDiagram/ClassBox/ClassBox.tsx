import type { ReactElement } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { ClassBoxProps, ClassMember } from "../../../parsers/classDiagram/diagramModel";
import styles from "./ClassBox.module.css";

type ClassBoxNode = Node<ClassBoxProps, "classBox">;

const resizeHandles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

/** Renders a single class box node on the React Flow canvas. */
export default function ClassBox({ data, selected }: NodeProps<ClassBoxNode>): ReactElement {
  const { node, style } = data;
  const fields = node.members.filter((member) => !member.isMethod);
  const methods = node.members.filter((member) => member.isMethod);
  const hasFieldsAndMethods = fields.length > 0 && methods.length > 0;

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
    <div
      className={`${styles.classBox} ${selected ? styles.selected : ""}`}
      style={dynamicVars}
      title={node.id}
    >
      <Handle
        className={styles.connectionHandle}
        id="top"
        type="source"
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        className={styles.connectionHandle}
        id="right"
        type="source"
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        className={styles.connectionHandle}
        id="bottom"
        type="source"
        position={Position.Bottom}
        isConnectable={false}
      />
      <Handle
        className={styles.connectionHandle}
        id="left"
        type="source"
        position={Position.Left}
        isConnectable={false}
      />
      <Handle
        className={styles.connectionHandle}
        id="target-top"
        type="target"
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        className={styles.connectionHandle}
        id="target-right"
        type="target"
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        className={styles.connectionHandle}
        id="target-bottom"
        type="target"
        position={Position.Bottom}
        isConnectable={false}
      />
      <Handle
        className={styles.connectionHandle}
        id="target-left"
        type="target"
        position={Position.Left}
        isConnectable={false}
      />
      <header className={styles.header}>
        {node.stereotype ? (
          <div className={styles.stereotype} title={node.stereotype}>
            &lt;&lt;{node.stereotype}&gt;&gt;
          </div>
        ) : null}
        <div className={styles.className} title={node.id}>
          {node.id}
        </div>
      </header>
      <div className={styles.body}>
        <MemberList members={fields} />
        {hasFieldsAndMethods ? <div className={styles.memberDivider} aria-hidden="true" /> : null}
        <MemberList members={methods} />
      </div>
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

function MemberList({ members }: { members: readonly ClassMember[] }): ReactElement {
  return (
    <div className={styles.memberList}>
      {members.map((member) => (
        <div
          key={`${member.location.line}:${member.location.raw}`}
          className={styles.memberRow}
          title={member.location.raw.trim()}
        >
          {formatMember(member)}
        </div>
      ))}
    </div>
  );
}

function formatMember(member: ClassMember): string {
  if (member.isMethod) {
    const params = member.params ?? "";
    const typeSuffix = member.type ? `: ${member.type}` : "";
    return `${member.visibility} ${member.name}(${params})${typeSuffix}`;
  }

  const typeSuffix = member.type ? `: ${member.type}` : "";
  return `${member.visibility} ${member.name}${typeSuffix}`;
}
