/**
 * @role [L]+[P] Logic and Presentational
 * @logic class position and size command derivation.
 * @presents Class-box node.
 */
import type { ReactElement } from "react";
import type { CSSProperties } from "react";
import ReactFlowConnectionHandlesAdapter from "./ReactFlowConnectionHandlesAdapter/ReactFlowConnectionHandlesAdapter";
import type { ConnectionHandleDescriptor } from "./ReactFlowConnectionHandlesAdapter/ReactFlowConnectionHandlesAdapter";
import ReactFlowNodeResizerAdapter from "./ReactFlowNodeResizerAdapter/ReactFlowNodeResizerAdapter";
import MemberTable from "./MemberTable/MemberTable";
import { useClassBoxInteractions } from "./useInteractions";
import type { ClassView } from "../../../../../../views/schema";
import styles from "./ClassBox.module.css";

type ClassBoxProps = {
  readonly view: ClassView;
  readonly isSelected: boolean;
  readonly isDragging: boolean;
  readonly isResizeVisible: boolean;
};

const CONNECTION_HANDLES: readonly ConnectionHandleDescriptor[] = [
  { id: "top", direction: "source", side: "top" },
  { id: "right", direction: "source", side: "right" },
  { id: "bottom", direction: "source", side: "bottom" },
  { id: "left", direction: "source", side: "left" },
  { id: "target-top", direction: "target", side: "top" },
  { id: "target-right", direction: "target", side: "right" },
  { id: "target-bottom", direction: "target", side: "bottom" },
  { id: "target-left", direction: "target", side: "left" },
];

export default function ClassBox({
  view,
  isSelected,
  isDragging,
  isResizeVisible,
}: ClassBoxProps): ReactElement {
  // @job connect:event:wire
  const { onResizeEnd } = useClassBoxInteractions(view.classId);

  // @job render:style
  const className = [
    styles.classBox,
    isSelected ? styles.selected : "",
    isDragging ? styles.dragging : "",
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
        nodeId={view.classId}
        isVisible={isResizeVisible}
        minWidth={80}
        minHeight={48}
        handleClassName={styles.resizeHandle}
        lineClassName={styles.resizeLine}
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
      <MemberTable view={view} isSelected={isSelected} />
    </div>
  );
}
