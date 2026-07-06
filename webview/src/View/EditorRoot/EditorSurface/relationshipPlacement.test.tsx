/**
 * @fileoverview Relationship placement interaction regression tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { toClassId } from "../../../shared/ids";
import type { EditorCommandTransaction } from "../../commands/editorCommands";
import { CommandDispatchProvider } from "../../contexts";
import type { DiagramView } from "../../views/schema";
import EditorSurface from "./EditorSurface";
import { useInteractions as useReactFlowCanvasInteractions } from "./DiagramCanvas/ReactFlowCanvasAdapter/useInteractions";

describe("relationship placement", () => {
  test("keeps placement armed after the source class click and creates one relationship", async () => {
    const onTransactionDispatch = vi.fn<(transaction: EditorCommandTransaction) => void>();

    render(
      <CommandDispatchProvider onTransactionDispatch={onTransactionDispatch}>
        <EditorSurface view={diagramView} />
      </CommandDispatchProvider>
    );

    const inheritanceButton = screen.getByRole("button", { name: "Inheritance" });

    fireEvent.click(inheritanceButton);
    expect(inheritanceButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByText("A"));
    expect(inheritanceButton).toHaveAttribute("aria-pressed", "true");
    expect(onTransactionDispatch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("B"));

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
  });

  test("clears only direct pane background clicks", () => {
    const onSelectionClear = vi.fn();

    render(<ReactFlowPaneClickProbe onSelectionClear={onSelectionClear} />);

    fireEvent.click(screen.getByTestId("pane-child"));
    expect(onSelectionClear).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("pane"));
    expect(onSelectionClear).toHaveBeenCalledTimes(1);
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
  ],
  namespaces: [],
  relationships: [],
  styles: [],
};

type ReactFlowPaneClickProbeProps = {
  readonly onSelectionClear: () => void;
};

function ReactFlowPaneClickProbe({ onSelectionClear }: ReactFlowPaneClickProbeProps): ReactElement {
  // Known jsdom limitation: React Flow's pane onClick does not fire reliably
  // through the mocked canvas, so this test drives the adapter callback directly.
  const { onPaneClick } = useReactFlowCanvasInteractions({
    onClassBoxPlacementChange: () => {},
    onDragComplete: () => {},
    onSelectionClear,
  });

  return (
    <div data-testid="pane" onClick={onPaneClick}>
      <div data-testid="pane-child" />
    </div>
  );
}
