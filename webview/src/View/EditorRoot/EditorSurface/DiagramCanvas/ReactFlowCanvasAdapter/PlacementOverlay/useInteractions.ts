/**
 * @logic PlacementOverlay pointer gesture state updates and class creation command dispatch.
 * @state origin and draftRect updates from pointer gestures.
 */

import { useCallback } from "react";
import type { Dispatch, PointerEvent, SetStateAction } from "react";
import { useReactFlow } from "@xyflow/react";
import type { Point, Rect } from "../../../../../../shared/geometry";
import { useDispatchTransaction } from "../../../../../contexts";
import type { DrawOrigin } from "./state";
import { toClassCreateTransaction } from "./transactions";

const DRAG_THRESHOLD = 4;

type Interactions = {
  readonly onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  readonly onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  readonly onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
};

type UseInteractionsInput = {
  readonly origin: DrawOrigin | null;
  readonly setOrigin: Dispatch<SetStateAction<DrawOrigin | null>>;
  readonly setDraftRect: Dispatch<SetStateAction<Rect | null>>;
  readonly onPlacementComplete: () => void;
};

/** ── interaction hook area ──
 * Patterns: 4.6-3, 4.8-2, 4.9-1
 */
export function useInteractions({
  origin,
  setOrigin,
  setDraftRect,
  onPlacementComplete,
}: UseInteractionsInput): Interactions {
  const { screenToFlowPosition } = useReactFlow();
  const dispatchCommand = useDispatchTransaction();

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
    [screenToFlowPosition, setOrigin, setDraftRect]
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
      const endFlow = screenToFlowPosition(endClient);
      const isMeaningfulDrag =
        Math.abs(endClient.x - origin.client.x) >= DRAG_THRESHOLD ||
        Math.abs(endClient.y - origin.client.y) >= DRAG_THRESHOLD;
      setOrigin(null);
      setDraftRect(null);
      if (!isMeaningfulDrag) return;

      const transaction = toClassCreateTransaction(normalizeRect(origin.flow, endFlow));
      dispatchCommand(transaction);
      onPlacementComplete();
    },
    [dispatchCommand, onPlacementComplete, origin, screenToFlowPosition, setDraftRect, setOrigin]
  );

  return { onPointerDown, onPointerMove, onPointerUp };
}

function normalizeRect(first: Point, second: Point): Rect {
  const x = Math.min(first.x, second.x);
  const y = Math.min(first.y, second.y);
  return { x, y, w: Math.abs(second.x - first.x), h: Math.abs(second.y - first.y) };
}
