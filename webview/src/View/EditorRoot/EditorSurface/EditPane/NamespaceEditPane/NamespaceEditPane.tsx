/**
 * @behavior Namespace name, style property, reset, and delete requests.
 * @render Namespace edit pane sections.
 */

import type { ReactElement } from "react";
import type { NamespaceId } from "../../../../../shared/ids";
import {
  STYLE_PROPERTIES,
  type StyleProperties,
  type StylePropertyName,
} from "../../../../../shared/style";
import type { TransactionResult } from "../../../../commands/editorCommands";
import {
  NAMESPACE_DEFAULT_FILL,
  NAMESPACE_DEFAULT_STROKE,
  NAMESPACE_DEFAULT_STROKE_WIDTH,
  STYLE_COLOR_PRESETS,
  STYLE_STROKE_DASHARRAY_PRESETS,
  STYLE_STROKE_WIDTH_PRESETS,
} from "../../../../config/editorUiConfig";
import { useDispatchTransaction } from "../../../../contexts";
import Button from "../../../../ui/primitives/Button/Button";
import CommitTextField from "../../../../ui/composites/CommitTextField/CommitTextField";
import ColorSelect from "../../../../ui/composites/ColorSelect/ColorSelect";
import Dropdown from "../../../../ui/composites/Dropdown/Dropdown";
import type { DropdownOption } from "../../../../ui/composites/Dropdown/Dropdown";
import StyledBoxSwatch from "../../../../ui/primitives/StyledBoxSwatch/StyledBoxSwatch";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";
import type { NamespaceView } from "../../../../views/schema";
import {
  toNamespaceDeleteTransaction,
  toNamespaceNameCommitTransaction,
  toNamespaceStylePropertySetTransaction,
  toNamespaceStyleResetTransaction,
} from "./transactions";

type NamespaceEditPaneProps = {
  readonly view: NamespaceView;
  readonly onNamespaceRenameCommitted: (
    result: TransactionResult,
    previousNamespaceId: NamespaceId
  ) => void;
};

const EMPTY_STYLE_PROPERTIES: StyleProperties = {
  fill: null,
  stroke: null,
  strokeWidth: null,
  strokeDasharray: null,
  color: null,
};

export default function NamespaceEditPane({
  view,
  onNamespaceRenameCommitted,
}: NamespaceEditPaneProps): ReactElement {
  const dispatchTransaction = useDispatchTransaction();
  const style = view.style ?? EMPTY_STYLE_PROPERTIES;

  function commitName(name: string): readonly string[] {
    const result = dispatchTransaction(
      toNamespaceNameCommitTransaction(view.namespaceId, name.trim())
    );
    if (result.status === "committed") {
      onNamespaceRenameCommitted(result, view.namespaceId);
      return [];
    }
    return result.errors.map((error) => error.message);
  }

  return (
    <>
      <PaneSection label="Selected namespace">
        <StyledBoxSwatch styleValues={style} label={view.label} />
        <CommitTextField
          initialValue={view.label}
          validate={() => []}
          ariaLabel="Namespace name"
          onCommit={(name) => commitName(name)}
          onDiscard={() => undefined}
          onCancel={() => undefined}
        />
      </PaneSection>
      <PaneSection label="Namespace style">
        {STYLE_PROPERTIES.map(({ name }) => (
          <NamespaceStyleControl
            key={name}
            property={name}
            value={style[name]}
            onChange={(value) =>
              dispatchTransaction(toNamespaceStylePropertySetTransaction(view, name, value))
            }
          />
        ))}
        <Button
          label="Reset style"
          disabled={view.style === null}
          onClick={() => dispatchTransaction(toNamespaceStyleResetTransaction(view.namespaceId))}
        />
      </PaneSection>
      <PaneSection label="">
        <Button
          label="Delete"
          tone="danger"
          onClick={() => dispatchTransaction(toNamespaceDeleteTransaction(view.namespaceId))}
        />
      </PaneSection>
    </>
  );
}

function NamespaceStyleControl({
  property,
  value,
  onChange,
}: {
  readonly property: StylePropertyName;
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
}): ReactElement {
  const selectedValue = value ?? "";

  return isColorProperty(property) ? (
    <ColorSelect
      presets={toColorPresetOptions(property)}
      value={selectedValue}
      onChange={(nextValue) => onChange(toNullableValue(nextValue))}
    />
  ) : (
    <Dropdown
      options={toStrokePresetOptions(property)}
      value={selectedValue}
      onChange={(nextValue) => onChange(toNullableValue(nextValue))}
    />
  );
}

function toColorPresetOptions(property: StylePropertyName): readonly DropdownOption[] {
  return STYLE_COLOR_PRESETS.map((preset) => ({
    value: preset.value,
    label: `${toPropertyLabel(property)}: ${preset.label}`,
    swatchStyle: {
      fill: property === "fill" ? toSwatchColor(preset.value, NAMESPACE_DEFAULT_FILL) : null,
      stroke: property === "stroke" ? toSwatchColor(preset.value, NAMESPACE_DEFAULT_STROKE) : null,
      color: property === "color" ? toSwatchColor(preset.value, null) : null,
    },
  }));
}

function toStrokePresetOptions(property: StylePropertyName): readonly DropdownOption[] {
  const presets =
    property === "strokeWidth" ? STYLE_STROKE_WIDTH_PRESETS : STYLE_STROKE_DASHARRAY_PRESETS;

  return presets.map((preset) => ({
    value: preset.value,
    label: `${toPropertyLabel(property)}: ${preset.label}`,
    swatchStyle: {
      strokeWidth:
        property === "strokeWidth" ? preset.value || `${NAMESPACE_DEFAULT_STROKE_WIDTH}px` : null,
      strokeDasharray: property === "strokeDasharray" ? preset.value || null : null,
    },
  }));
}

function isColorProperty(property: StylePropertyName): boolean {
  return property === "fill" || property === "stroke" || property === "color";
}

function toPropertyLabel(property: StylePropertyName): string {
  switch (property) {
    case "fill":
      return "Fill";
    case "stroke":
      return "Stroke";
    case "strokeWidth":
      return "Stroke width";
    case "strokeDasharray":
      return "Stroke dasharray";
    case "color":
      return "Text";
  }
}

function toSwatchColor(value: string, fallback: string | null): string | null {
  return value === "" ? fallback : value;
}

function toNullableValue(value: string): string | null {
  return value === "" ? null : value;
}
