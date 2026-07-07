/**
 * @fileoverview Relationship placement interaction regression tests.
 */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { toClassId, toRelationshipId, type ClassId, type RelationshipId } from "../../shared/ids";
import type { EditorCommandTransaction } from "../commands/editorCommands";
import { CommandDispatchProvider } from "../contexts";
import type { DiagramView } from "../views/schema";
import EditorSurface from "../EditorRoot/EditorSurface/EditorSurface";
import { useInteractions as useReactFlowCanvasInteractions } from "../EditorRoot/EditorSurface/DiagramCanvas/ReactFlowCanvasAdapter/ReactFlowCanvasAdapterContent/useInteractions";

vi.mock(
  "../EditorRoot/EditorSurface/DiagramCanvas/ReactFlowCanvasAdapter/ReactFlowCanvasAdapter",
  () => ({
    default: MockReactFlowCanvasAdapter,
  })
);

afterEach(() => cleanup());

describe("relationship placement", () => {
  test("arms placement and creates one relationship through the connection seam", async () => {
    const onTransactionDispatch = vi.fn<(transaction: EditorCommandTransaction) => void>();

    render(
      <CommandDispatchProvider onTransactionDispatch={onTransactionDispatch}>
        <EditorSurface view={diagramView} />
      </CommandDispatchProvider>
    );

    const inheritanceButton = screen.getByRole("button", { name: "Inheritance" });

    fireEvent.click(inheritanceButton);
    expect(inheritanceButton).toHaveAttribute("aria-pressed", "true");

    // Known jsdom limitation: React Flow connection drags cannot be simulated
    // faithfully here, so this test drives EditorSurface's adapter callback seam.
    fireEvent.click(screen.getByTestId("connect-a-b"));

    await waitFor(() => expect(onTransactionDispatch).toHaveBeenCalledTimes(1));
    expect(onTransactionDispatch).toHaveBeenCalledWith([
      {
        type: "relationship.create",
        source: {
          classId: toClassId("A"),
          multiplicity: null,
          endpointKind: "triangle",
        },
        target: {
          classId: toClassId("B"),
          multiplicity: null,
          endpointKind: "none",
        },
        lineKind: "solid",
        label: null,
      },
    ]);
    expect(inheritanceButton).not.toHaveAttribute("aria-pressed", "true");
  });

  test("cancels placement through the adapter seam", () => {
    const onTransactionDispatch = vi.fn<(transaction: EditorCommandTransaction) => void>();

    render(
      <CommandDispatchProvider onTransactionDispatch={onTransactionDispatch}>
        <EditorSurface view={diagramView} />
      </CommandDispatchProvider>
    );

    const inheritanceButton = screen.getByRole("button", { name: "Inheritance" });

    fireEvent.click(inheritanceButton);
    expect(inheritanceButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByTestId("cancel-placement"));
    expect(inheritanceButton).not.toHaveAttribute("aria-pressed", "true");
    expect(onTransactionDispatch).not.toHaveBeenCalled();
  });

  test("reports only direct pane background clicks and invalid placement connection endings", () => {
    const onBackgroundClick = vi.fn();
    const onConnectAborted = vi.fn();

    render(
      <ReactFlowInteractionProbe
        onBackgroundClick={onBackgroundClick}
        onConnectAborted={onConnectAborted}
      />
    );

    fireEvent.click(screen.getByTestId("pane-child"));
    expect(onBackgroundClick).not.toHaveBeenCalled();
    expect(onConnectAborted).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("pane"));
    expect(onBackgroundClick).toHaveBeenCalledTimes(1);
    expect(onConnectAborted).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("invalid-placement-connect-end"));
    expect(onBackgroundClick).toHaveBeenCalledTimes(1);
    expect(onConnectAborted).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("invalid-idle-connect-end"));
    expect(onBackgroundClick).toHaveBeenCalledTimes(1);
    expect(onConnectAborted).toHaveBeenCalledTimes(1);
  });

  test("dispatches relationship class set for changed reconnect endpoints only", () => {
    const onTransactionDispatch = vi.fn<(transaction: EditorCommandTransaction) => void>();

    render(
      <CommandDispatchProvider onTransactionDispatch={onTransactionDispatch}>
        <EditorSurface view={diagramView} />
      </CommandDispatchProvider>
    );

    fireEvent.click(screen.getByTestId("reconnect-source-c"));
    expect(onTransactionDispatch).toHaveBeenCalledTimes(1);
    expect(onTransactionDispatch).toHaveBeenCalledWith([
      {
        type: "relationship.source.class.set",
        relationshipId: toRelationshipId("A--B--0"),
        classId: toClassId("C"),
      },
    ]);

    onTransactionDispatch.mockClear();
    fireEvent.click(screen.getByTestId("reconnect-source-a"));
    expect(onTransactionDispatch).not.toHaveBeenCalled();
  });
});

const diagramView: DiagramView = {
  classes: [
    {
      classId: toClassId("A"),
      bounds: { x: 0, y: 0, w: 140, h: 80 },
      header: { label: "A" },
      members: [],
    },
    {
      classId: toClassId("B"),
      bounds: { x: 220, y: 0, w: 140, h: 80 },
      header: { label: "B" },
      members: [],
    },
    {
      classId: toClassId("C"),
      bounds: { x: 440, y: 0, w: 140, h: 80 },
      header: { label: "C" },
      members: [],
    },
  ],
  namespaces: [],
  relationships: [
    {
      relationshipId: toRelationshipId("A--B--0"),
      sourceClassId: toClassId("A"),
      targetClassId: toClassId("B"),
      sourceEndpointKind: "triangle",
      targetEndpointKind: "none",
      lineKind: "solid",
    },
  ],
  styles: [],
};

type MockReactFlowCanvasAdapterProps = {
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onRelationshipReconnect: (
    relationshipId: RelationshipId,
    end: "source" | "target",
    newClassId: ClassId
  ) => void;
  readonly onBackgroundClick: () => void;
};

function MockReactFlowCanvasAdapter({
  onRelationshipConnect,
  onRelationshipReconnect,
  onBackgroundClick,
}: MockReactFlowCanvasAdapterProps): ReactElement {
  return (
    <div>
      <button
        type="button"
        data-testid="connect-a-b"
        onClick={() => onRelationshipConnect(toClassId("A"), toClassId("B"))}
      >
        Connect A to B
      </button>
      <button type="button" data-testid="cancel-placement" onClick={onBackgroundClick}>
        Cancel placement
      </button>
      <button
        type="button"
        data-testid="reconnect-source-c"
        onClick={() =>
          onRelationshipReconnect(toRelationshipId("A--B--0"), "source", toClassId("C"))
        }
      >
        Reconnect source to C
      </button>
      <button
        type="button"
        data-testid="reconnect-source-a"
        onClick={() =>
          onRelationshipReconnect(toRelationshipId("A--B--0"), "source", toClassId("A"))
        }
      >
        Reconnect source to A
      </button>
    </div>
  );
}

type ReactFlowInteractionProbeProps = {
  readonly onBackgroundClick: () => void;
  readonly onConnectAborted: () => void;
};

function ReactFlowInteractionProbe({
  onBackgroundClick,
  onConnectAborted,
}: ReactFlowInteractionProbeProps): ReactElement {
  // Known jsdom limitation: React Flow's pane onClick does not fire reliably
  // through the mocked canvas, so this test drives the adapter callback directly.
  const { onConnectEnd: onPlacementConnectEnd, onPaneClick } = useReactFlowCanvasInteractions({
    callbacks: {
      onClassBoxPlacementChange: () => {},
      onDragComplete: () => {},
      onRelationshipConnect: () => {},
      onRelationshipReconnect: () => {},
      onBackgroundClick,
      onConnectAborted,
    },
    isRelationshipPlacementArmed: true,
    pressPointRef: { current: null },
    screenToFlowPosition: (position) => position,
  });
  const { onConnectEnd: onIdleConnectEnd } = useReactFlowCanvasInteractions({
    callbacks: {
      onClassBoxPlacementChange: () => {},
      onDragComplete: () => {},
      onRelationshipConnect: () => {},
      onRelationshipReconnect: () => {},
      onBackgroundClick,
      onConnectAborted,
    },
    isRelationshipPlacementArmed: false,
    pressPointRef: { current: null },
    screenToFlowPosition: (position) => position,
  });

  return (
    <>
      <div data-testid="pane" onClick={onPaneClick}>
        <div data-testid="pane-child" />
      </div>
      <button
        type="button"
        data-testid="invalid-placement-connect-end"
        onClick={() => onPlacementConnectEnd(new MouseEvent("mouseup"), invalidConnectionState)}
      >
        Invalid placement connect end
      </button>
      <button
        type="button"
        data-testid="invalid-idle-connect-end"
        onClick={() => onIdleConnectEnd(new MouseEvent("mouseup"), invalidConnectionState)}
      >
        Invalid idle connect end
      </button>
    </>
  );
}

const invalidConnectionState = {
  isValid: false,
  from: null,
  fromHandle: null,
  fromPosition: null,
  fromNode: null,
  to: null,
  toHandle: null,
  toPosition: null,
  toNode: null,
  pointer: null,
};
