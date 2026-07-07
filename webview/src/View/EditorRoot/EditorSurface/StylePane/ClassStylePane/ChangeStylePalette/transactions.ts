/**
 * @behavior Class style palette transaction derivation.
 */

import type { EditorCommandTransaction } from "../../../../../commands/editorCommands";
import type { ClassView } from "../../../../../views/schema";
import {
  STYLE_PROPERTIES,
  type StyleProperties,
  type StylePropertyName,
} from "../../../../../../shared/style";

export function toClassStylePropertySetTransaction(
  selectedClasses: readonly ClassView[],
  property: StylePropertyName,
  value: string | null
): EditorCommandTransaction {
  return shouldUsePropertySet(selectedClasses)
    ? selectedClasses.map((classView) => ({
        type: "class.directStyle.property.set",
        classId: classView.classId,
        property,
        value,
      }))
    : selectedClasses.flatMap((classView) => [
        {
          type: "class.directStyle.set" as const,
          classId: classView.classId,
          properties: toStyleWithProperty(classView.style, property, value),
        },
        {
          type: "class.appliedStyle.set" as const,
          classId: classView.classId,
          styleDefId: null,
        },
      ]);
}

// Private helpers
const EMPTY_STYLE_PROPERTIES: StyleProperties = {
  fill: null,
  stroke: null,
  strokeWidth: null,
  strokeDasharray: null,
  color: null,
};

function shouldUsePropertySet(selectedClasses: readonly ClassView[]): boolean {
  const first = selectedClasses[0];
  return (
    first !== undefined &&
    !first.appliedStyleId &&
    hasStyleValue(first.style) &&
    selectedClasses.every(
      (classView) => !classView.appliedStyleId && areStylesEqual(classView.style, first.style)
    )
  );
}

function toStyleWithProperty(
  style: StyleProperties | undefined,
  property: StylePropertyName,
  value: string | null
): StyleProperties {
  return { ...(style ?? EMPTY_STYLE_PROPERTIES), [property]: value };
}

function hasStyleValue(style: StyleProperties | undefined): boolean {
  return style !== undefined && STYLE_PROPERTIES.some(({ name }) => style[name] !== null);
}

function areStylesEqual(
  left: StyleProperties | undefined,
  right: StyleProperties | undefined
): boolean {
  return STYLE_PROPERTIES.every(
    ({ name }) => (left ?? EMPTY_STYLE_PROPERTIES)[name] === (right ?? EMPTY_STYLE_PROPERTIES)[name]
  );
}
