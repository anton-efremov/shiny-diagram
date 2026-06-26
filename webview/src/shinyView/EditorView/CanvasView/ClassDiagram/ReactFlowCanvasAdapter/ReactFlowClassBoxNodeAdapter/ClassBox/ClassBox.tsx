/**
 * @role [L]+[P] Logic and Presentational
 * @logic class position and size command derivation.
 * @presents Class-box node.
 */
import type { ReactElement } from "react";
import type { CSSProperties } from "react";
import ReactFlowConnectionHandlesAdapter from "./ReactFlowConnectionHandlesAdapter/ReactFlowConnectionHandlesAdapter";
import ReactFlowNodeResizerAdapter from "./ReactFlowNodeResizerAdapter/ReactFlowNodeResizerAdapter";
import MemberTable from "./MemberTable/MemberTable";
import {
  toMemberTableView,
  toReactFlowConnectionHandlesAdapterView,
  toReactFlowNodeResizerAdapterView,
} from "./childViews";
import { useClassBoxInteractions } from "./useInteractions";
import type { ClassBoxView } from "./views";
import styles from "./ClassBox.module.css";

type ClassBoxProps = {
  readonly view: ClassBoxView;
};

export default function ClassBox({ view }: ClassBoxProps): ReactElement {
  // @job connect:event:wire
  const { onResizeEnd } = useClassBoxInteractions(view.classId);

  // @job logic:child:view
  const nodeResizerView = toReactFlowNodeResizerAdapterView({
    view,
    handleClassName: styles.resizeHandle,
    lineClassName: styles.resizeLine,
  });
  const connectionHandlesView = toReactFlowConnectionHandlesAdapterView({
    className: styles.connectionHandle,
  });
  const memberTableView = toMemberTableView(view);

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
      <ReactFlowNodeResizerAdapter view={nodeResizerView} onResizeEnd={onResizeEnd} />
      <ReactFlowConnectionHandlesAdapter view={connectionHandlesView} />
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
      <MemberTable view={memberTableView} />
    </div>
  );
}
