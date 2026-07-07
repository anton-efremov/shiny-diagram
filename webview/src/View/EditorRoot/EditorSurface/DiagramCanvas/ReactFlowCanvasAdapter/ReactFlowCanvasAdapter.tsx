/**
 * @framework View diagram canvas props to React Flow canvas props and events.
 */

import type { ReactElement } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import type { ClassId, RelationshipId } from "../../../../../shared/ids";
import type { DiagramView } from "../../../../views/schema";
import type {
  ClassBoxPlacementState,
  NodePlacementState,
  SelectionState,
} from "../../../../state/editorStates";
import ReactFlowCanvasAdapterContent from "./ReactFlowCanvasAdapterContent/ReactFlowCanvasAdapterContent";

type ClassBoxPlacementChange = {
  readonly classId: ClassId;
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
};

type ReactFlowCanvasAdapterProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly nodePlacementState: NodePlacementState;
  readonly classBoxPlacementState: ClassBoxPlacementState;
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onRelationshipReconnect: (
    relationshipId: RelationshipId,
    end: "source" | "target",
    newClassId: ClassId
  ) => void;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly onBackgroundClick: () => void;
  readonly onConnectAborted: () => void;
  readonly onPlacementComplete: () => void;
};

export default function ReactFlowCanvasAdapter({
  view,
  selectionState,
  nodePlacementState,
  classBoxPlacementState,
  onClassBoxPlacementChange,
  onDragComplete,
  onClassSelect,
  onRelationshipConnect,
  onRelationshipReconnect,
  onRelationshipSelect,
  onBackgroundClick,
  onConnectAborted,
  onPlacementComplete,
}: ReactFlowCanvasAdapterProps): ReactElement {
  return (
    <ReactFlowProvider>
      <ReactFlowCanvasAdapterContent
        view={view}
        selectionState={selectionState}
        nodePlacementState={nodePlacementState}
        classBoxPlacementState={classBoxPlacementState}
        onClassBoxPlacementChange={onClassBoxPlacementChange}
        onDragComplete={onDragComplete}
        onClassSelect={onClassSelect}
        onRelationshipConnect={onRelationshipConnect}
        onRelationshipReconnect={onRelationshipReconnect}
        onRelationshipSelect={onRelationshipSelect}
        onBackgroundClick={onBackgroundClick}
        onConnectAborted={onConnectAborted}
        onPlacementComplete={onPlacementComplete}
      />
    </ReactFlowProvider>
  );
}
