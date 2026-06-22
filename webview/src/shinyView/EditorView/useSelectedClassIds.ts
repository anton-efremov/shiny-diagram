/**
 * @fileoverview EditorView-owned selected class ID state.
 */

import { useCallback, useEffect, useState } from "react";
import type { ClassId } from "../../shared/ids";
import type { ElementViews } from "./views";

type UseSelectedClassIdsResult = {
  readonly selectedClassIds: readonly ClassId[];
  readonly setSelectedClassIds: (classIds: readonly ClassId[]) => void;
};

export function useSelectedClassIds(elements: ElementViews | null): UseSelectedClassIdsResult {
  const [selectedClassIds, setSelectedClassIdsRaw] = useState<readonly ClassId[]>([]);

  useEffect(() => {
    setSelectedClassIdsRaw((prev) => {
      const reconciled = reconcileSelectedClassIds(prev, elements);
      return areClassIdCollectionsEqual(prev, reconciled) ? prev : reconciled;
    });
  }, [elements]);

  const setSelectedClassIds = useCallback((classIds: readonly ClassId[]) => {
    setSelectedClassIdsRaw((prev) =>
      areClassIdCollectionsEqual(prev, classIds) ? prev : classIds
    );
  }, []);

  return { selectedClassIds, setSelectedClassIds };
}

function reconcileSelectedClassIds(
  selectedClassIds: readonly ClassId[],
  elements: ElementViews | null
): readonly ClassId[] {
  if (selectedClassIds.length === 0 || !elements)
    return selectedClassIds.length === 0 ? selectedClassIds : [];

  const selected = new Set(selectedClassIds);
  return elements.classes.flatMap((view) => (selected.has(view.classId) ? [view.classId] : []));
}

function areClassIdCollectionsEqual(left: readonly ClassId[], right: readonly ClassId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
