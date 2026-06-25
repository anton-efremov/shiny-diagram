/**
 * @fileoverview ClassBox render contract.
 * Extracted because ClassBox is an exclusively owned child component of ReactFlowClassBoxNodeAdapter.
 */

import type { ClassId } from "../../../../../../../shared/ids";
import type { ClassBoxMemberView } from "./MemberTable/views";

export type ClassBoxRenderView = {
  readonly classId: ClassId;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly ClassBoxMemberView[];
  readonly style?: {
    readonly fill?: string;
    readonly stroke?: string;
    readonly color?: string;
    readonly name?: string;
  };
  readonly isSelected: boolean;
  readonly isDragging: boolean;
  readonly isResizeVisible: boolean;
};
