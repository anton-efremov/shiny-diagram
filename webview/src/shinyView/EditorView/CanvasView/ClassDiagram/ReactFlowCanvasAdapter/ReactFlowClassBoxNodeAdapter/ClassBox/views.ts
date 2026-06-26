/**
 * @fileoverview ClassBox render contract.
 * Extracted because ClassBox is an exclusively owned child component of ReactFlowClassBoxNodeAdapter.
 */

import type { ClassId } from "../../../../../../../shared/ids";
import type { ClassStyleProperties } from "../../../../../../../shared/diagramVocabulary";
import type { MemberRowView } from "./MemberTable/views";

export type ClassBoxView = {
  readonly classId: ClassId;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly MemberRowView[];
  readonly style?: ClassStyleProperties;
  readonly isSelected: boolean;
  readonly isDragging: boolean;
  readonly isResizeVisible: boolean;
};
