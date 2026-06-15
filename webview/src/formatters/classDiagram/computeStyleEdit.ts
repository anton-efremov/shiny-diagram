/**
 * @fileoverview Computes the LineEdit for a style property change —
 * rebuilds the classDef line with the new property value.
 */

import type { StyleDefNode, StyleProperty } from "../../models/classDiagram/diagramTreeModel";
import type { LineEdit } from "../../extensionBridge/protocol";
import { formatStyleProperty } from "./formatLines";

export function computeStyleEdit(
  styleDef: StyleDefNode,
  property: StyleProperty["property"],
  value: string
): LineEdit {
  const newText = formatStyleProperty(styleDef, property, value);
  return { lineNumber: styleDef.location.startLine, newText };
}
