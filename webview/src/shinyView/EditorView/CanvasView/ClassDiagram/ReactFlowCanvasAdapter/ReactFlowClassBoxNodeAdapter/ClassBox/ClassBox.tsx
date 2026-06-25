/**
 * @role [L]+[P] Logic and Presentational
 * @logic class.resize command derivation.
 * @presents Class-box node.
 */
import type { ReactElement } from "react";
import type { CSSProperties } from "react";
import ReactFlowConnectionHandlesAdapter from "./ReactFlowConnectionHandlesAdapter/ReactFlowConnectionHandlesAdapter";
import ReactFlowNodeResizerAdapter from "./ReactFlowNodeResizerAdapter/ReactFlowNodeResizerAdapter";
import MemberTable from "./MemberTable/MemberTable";
import { useClassBoxInteractions } from "./useInteractions";
import type { ClassBoxRenderView } from "./views";
import styles from "./ClassBox.module.css";

const CONNECTION_HANDLES = [
  { id: "top", direction: "source", side: "top" },
  { id: "right", direction: "source", side: "right" },
  { id: "bottom", direction: "source", side: "bottom" },
  { id: "left", direction: "source", side: "left" },
  { id: "target-top", direction: "target", side: "top" },
  { id: "target-right", direction: "target", side: "right" },
  { id: "target-bottom", direction: "target", side: "bottom" },
  { id: "target-left", direction: "target", side: "left" },
] as const;

type ClassBoxProps = {
  readonly view: ClassBoxRenderView;
};

export default function ClassBox({ view }: ClassBoxProps): ReactElement {
  // @job connect:command:wire
  const { onResizeEnd } = useClassBoxInteractions(view.classId);

  // @job connect:child:view
  const fields = view.members.filter((m) => m.kind === "field");
  const methods = view.members.filter((m) => m.kind === "method");

  // @job render:style
  const className = [
    styles.classBox,
    view.isSelected ? styles.selected : "",
    view.isDragging ? styles.dragging : "",
  ]
    .filter(Boolean)
    .join(" ");

  const dynamicVars = view.style
    ? ({
        "--class-fill": view.style.fill,
        "--class-stroke": view.style.stroke,
        "--class-color": view.style.color,
      } as CSSProperties)
    : undefined;

  // @job render:structure
  return (
    <div className={className} style={dynamicVars} title={view.classId}>
      <ReactFlowNodeResizerAdapter
        view={{
          nodeId: view.classId,
          isVisible: view.isResizeVisible,
          minWidth: 80,
          minHeight: 48,
          handleClassName: styles.resizeHandle,
          lineClassName: styles.resizeLine,
        }}
        onResizeEnd={onResizeEnd}
      />
      <ReactFlowConnectionHandlesAdapter
        handles={CONNECTION_HANDLES}
        className={styles.connectionHandle}
      />
      <header className={styles.header}>
        {view.header.stereotype ? (
          <div className={styles.stereotype} title={view.header.stereotype}>
            &lt;&lt;{view.header.stereotype}&gt;&gt;
          </div>
        ) : null}
        <div className={styles.className} title={view.header.label}>
          {view.header.label}
        </div>
      </header>
      <MemberTable view={{ fields, methods, isSelected: view.isSelected }} />
    </div>
  );
}
