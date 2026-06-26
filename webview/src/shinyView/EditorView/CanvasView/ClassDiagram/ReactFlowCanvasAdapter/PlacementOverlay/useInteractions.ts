/**
 * @fileoverview PlacementOverlay interaction pipeline.
 * Translates pointer events into class.create transactions and placement.complete state actions.
 * Owns no state; state is provided by PlacementOverlay.
 */

import { useCallback } from "react";
import type { PointerEvent } from "react";
import { useReactFlow } from "@xyflow/react";
import type { Point, Rect } from "../../../../../../shared/geometry";
import { useDispatchCanvasViewStateAction } from "../../../contexts";
import { useDispatchCommand } from "../../../../contexts";
import { toClassCreateTransaction } from "./commands";

const DRAG_THRESHOLD = 4;

export type DrawOrigin = {
  readonly pointerId: number;
  readonly client: Point;
  readonly flow: Point;
};

type UsePlacementOverlayInteractionsResult = {
  readonly onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  readonly onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  readonly onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
};

export function usePlacementOverlayInteractions(
  origin: DrawOrigin | null,
  setOrigin: (origin: DrawOrigin | null) => void,
  setDraftRect: (rect: Rect | null) => void
): UsePlacementOverlayInteractionsResult {
  const { screenToFlowPosition } = useReactFlow();
  const dispatchCommand = useDispatchCommand();
  const dispatchCanvasViewStateAction = useDispatchCanvasViewStateAction();

  // @job connect:event:wire
  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      // @job connect:event:normalize
      setOrigin({
        pointerId: event.pointerId,
        client: { x: event.clientX, y: event.clientY },
        flow: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      });
      setDraftRect(null);
    },
    [screenToFlowPosition, setOrigin, setDraftRect]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!origin || event.pointerId !== origin.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      // @job connect:event:normalize
      const bounds = event.currentTarget.getBoundingClientRect();
      setDraftRect(
        normalizeRect(
          { x: origin.client.x - bounds.left, y: origin.client.y - bounds.top },
          { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
        )
      );
    },
    [origin, setDraftRect]
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!origin || event.pointerId !== origin.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const endClient = { x: event.clientX, y: event.clientY };
      // @job connect:event:normalize
      const endFlow = screenToFlowPosition(endClient);
      const isMeaningfulDrag =
        Math.abs(endClient.x - origin.client.x) >= DRAG_THRESHOLD ||
        Math.abs(endClient.y - origin.client.y) >= DRAG_THRESHOLD;
      setOrigin(null);
      setDraftRect(null);
      if (!isMeaningfulDrag) return;

      // @job logic:command:derive
      const transaction = toClassCreateTransaction(normalizeRect(origin.flow, endFlow));

      // @job connect:command:wire
      dispatchCommand(transaction);

      // @job connect:state:wire
      dispatchCanvasViewStateAction({ type: "placement.complete" });
    },
    [
      dispatchCanvasViewStateAction,
      dispatchCommand,
      origin,
      screenToFlowPosition,
      setDraftRect,
      setOrigin,
    ]
  );

  return { onPointerDown, onPointerMove, onPointerUp };
}

function normalizeRect(first: Point, second: Point): Rect {
  const x = Math.min(first.x, second.x);
  const y = Math.min(first.y, second.y);
  return { x, y, w: Math.abs(second.x - first.x), h: Math.abs(second.y - first.y) };
}
