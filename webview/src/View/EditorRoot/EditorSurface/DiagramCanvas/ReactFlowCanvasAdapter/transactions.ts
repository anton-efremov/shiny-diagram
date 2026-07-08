/**
 * @behavior Namespace creation and namespace movement transaction derivation.
 */

import type { Point, Rect } from "../../../../../shared/geometry";
import type { ClassId, NamespaceId } from "../../../../../shared/ids";
import type { EditorCommandTransaction } from "../../../../commands/editorCommands";
import type { ClassBoxPlacementState } from "../../../../state/editorStates";
import type { DiagramView } from "../../../../views/schema";

export type NamespaceCreateMembers = {
  readonly classIds: readonly ClassId[];
  readonly namespaceIds: readonly NamespaceId[];
};

export function toNamespaceCreateTransaction(
  members: NamespaceCreateMembers
): EditorCommandTransaction {
  return [
    {
      type: "namespace.create",
      initialClassIds: members.classIds,
      initialNamespaceIds: members.namespaceIds,
    },
  ];
}

export function toNamespaceMoveTransaction(
  namespaceId: NamespaceId,
  delta: Point,
  view: Pick<DiagramView, "classes" | "namespaces">,
  classBoxPlacementState: ClassBoxPlacementState
): EditorCommandTransaction {
  const memberClassIds = toTransitiveMemberClassIds(namespaceId, view);
  return memberClassIds.flatMap((classId) => {
    const rect = classBoxPlacementState.rectByClassId.get(classId);
    if (!rect) return [];
    return [
      {
        type: "class.spatial.set" as const,
        classId,
        spatial: {
          position: { x: Math.round(rect.x + delta.x), y: Math.round(rect.y + delta.y) },
          size: { width: rect.w, height: rect.h },
        },
      },
    ];
  });
}

export function toNamespaceDropTransaction(
  namespaceId: NamespaceId,
  delta: Point,
  parentNamespaceId: NamespaceId | null,
  view: Pick<DiagramView, "classes" | "namespaces">,
  classBoxPlacementState: ClassBoxPlacementState
): EditorCommandTransaction {
  const namespaceView = view.namespaces.find((candidate) => candidate.namespaceId === namespaceId);
  return [
    ...toNamespaceMoveTransaction(namespaceId, delta, view, classBoxPlacementState),
    ...(namespaceView && namespaceView.parentNamespaceId !== parentNamespaceId
      ? [
          {
            type: "namespace.parentNamespace.set" as const,
            namespaceId,
            parentNamespaceId,
          },
        ]
      : []),
  ];
}

export function toNamespaceResizeTransaction(
  namespaceId: NamespaceId,
  pendingClassIds: readonly ClassId[],
  pendingNamespaceIds: readonly NamespaceId[],
  view: Pick<DiagramView, "classes" | "namespaces">
): EditorCommandTransaction {
  const namespaceView = view.namespaces.find((candidate) => candidate.namespaceId === namespaceId);
  if (!namespaceView) return [];
  const pendingClasses = new Set(pendingClassIds);
  const pendingNamespaces = new Set(pendingNamespaceIds);
  return [
    ...namespaceView.memberClassIds.flatMap((classId) =>
      pendingClasses.has(classId)
        ? []
        : [
            {
              type: "class.parentNamespace.set" as const,
              classId,
              parentNamespaceId: namespaceView.parentNamespaceId,
            },
          ]
    ),
    ...namespaceView.childNamespaceIds.flatMap((childNamespaceId) =>
      pendingNamespaces.has(childNamespaceId)
        ? []
        : [
            {
              type: "namespace.parentNamespace.set" as const,
              namespaceId: childNamespaceId,
              parentNamespaceId: namespaceView.parentNamespaceId,
            },
          ]
    ),
    ...view.classes.flatMap((classView) =>
      classView.parentNamespaceId === null && pendingClasses.has(classView.classId)
        ? [
            {
              type: "class.parentNamespace.set" as const,
              classId: classView.classId,
              parentNamespaceId: namespaceId,
            },
          ]
        : []
    ),
    ...view.namespaces.flatMap((candidate) =>
      candidate.parentNamespaceId === null &&
      candidate.namespaceId !== namespaceId &&
      pendingNamespaces.has(candidate.namespaceId)
        ? [
            {
              type: "namespace.parentNamespace.set" as const,
              namespaceId: candidate.namespaceId,
              parentNamespaceId: namespaceId,
            },
          ]
        : []
    ),
  ];
}

export function toClassDropTransaction(
  classId: ClassId,
  rect: Rect,
  parentNamespaceId: NamespaceId | null,
  view: Pick<DiagramView, "classes">
): EditorCommandTransaction {
  const classView = view.classes.find((candidate) => candidate.classId === classId);
  if (!classView) return [];
  return [
    {
      type: "class.spatial.set" as const,
      classId,
      spatial: {
        position: { x: Math.round(rect.x), y: Math.round(rect.y) },
        size: { width: rect.w, height: rect.h },
      },
    },
    ...(classView.parentNamespaceId === parentNamespaceId
      ? []
      : [
          {
            type: "class.parentNamespace.set" as const,
            classId,
            parentNamespaceId,
          },
        ]),
  ];
}

export function toTransitiveMemberClassIds(
  namespaceId: NamespaceId,
  view: Pick<DiagramView, "classes" | "namespaces">
): readonly ClassId[] {
  const namespaceView = view.namespaces.find((candidate) => candidate.namespaceId === namespaceId);
  if (!namespaceView) return [];
  const childClassIds = namespaceView.childNamespaceIds.flatMap((childNamespaceId) =>
    toTransitiveMemberClassIds(childNamespaceId, view)
  );
  return [...namespaceView.memberClassIds, ...childClassIds];
}
