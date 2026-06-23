/**
 * @fileoverview Hook for translating placement overlay interactions into editor commands.
 */

import { useCallback, useState } from "react";
import type { PointerEvent } from "react";
import { useReactFlow } from "@xyflow/react";
import type { Point, Rect } from "../../../../../shared/geometry";
import { useDispatchEditorStateAction } from "../../contexts";
import { useDispatchCommand } from "../../../contexts";

const DRAG_THRESHOLD = 4;

type DrawOrigin = {
  readonly pointerId: number;
  readonly client: Point;
  readonly flow: Point;
};

type UsePlacementOverlayInteractionsResult = {
  draftRect: Rect | null;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
};

/**
 * Dispatches placement commands from the overlay interaction surface.
 */
export function usePlacementOverlayInteractions(): UsePlacementOverlayInteractionsResult {
  const { screenToFlowPosition } = useReactFlow();
  const dispatchCommand = useDispatchCommand();
  const dispatchEditorStateAction = useDispatchEditorStateAction();
  const [origin, setOrigin] = useState<DrawOrigin | null>(null);
  const [draftRect, setDraftRect] = useState<Rect | null>(null);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      event.currentTarget.setPointerCapture(event.pointerId);
      setOrigin({
        pointerId: event.pointerId,
        client: { x: event.clientX, y: event.clientY },
        flow: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      });
      setDraftRect(null);
    },
    [screenToFlowPosition]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!origin || event.pointerId !== origin.pointerId) return;

      event.preventDefault();
      event.stopPropagation();

      const bounds = event.currentTarget.getBoundingClientRect();
      setDraftRect(
        normalizeRect(
          { x: origin.client.x - bounds.left, y: origin.client.y - bounds.top },
          { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
        )
      );
    },
    [origin]
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
      const endFlow = screenToFlowPosition(endClient);
      const isMeaningfulDrag =
        Math.abs(endClient.x - origin.client.x) >= DRAG_THRESHOLD ||
        Math.abs(endClient.y - origin.client.y) >= DRAG_THRESHOLD;

      setOrigin(null);
      setDraftRect(null);

      if (!isMeaningfulDrag) return;

      dispatchCommand({ type: "class.add", rect: normalizeRect(origin.flow, endFlow) });
      dispatchEditorStateAction({ type: "placement.complete" });
    },
    [dispatchCommand, dispatchEditorStateAction, origin, screenToFlowPosition]
  );

  return { draftRect, onPointerDown, onPointerMove, onPointerUp };
}

function normalizeRect(first: Point, second: Point): Rect {
  const x = Math.min(first.x, second.x);
  const y = Math.min(first.y, second.y);

  return {
    x,
    y,
    w: Math.abs(second.x - first.x),
    h: Math.abs(second.y - first.y),
  };
}
