/**
 * @behavior Local namespace name draft and namespace property edit requests.
 * @render Namespace property inspector sections.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
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
  NAMESPACE_STYLE_PANE_COLOR_PICKER_FALLBACK,
  NAMESPACE_STYLE_PANE_CONTROL_GAP,
  NAMESPACE_STYLE_PANE_FIELD_GAP,
  NAMESPACE_STYLE_PANE_FONT_SIZE,
  NAMESPACE_STYLE_PANE_INPUT_PADDING_X,
  NAMESPACE_STYLE_PANE_INPUT_PADDING_Y,
  NAMESPACE_STYLE_PANE_INPUT_RADIUS,
  NAMESPACE_STYLE_PANE_INPUT_BORDER_WIDTH,
  NAMESPACE_STYLE_PANE_INPUT_MIN_WIDTH,
  NAMESPACE_STYLE_PANE_SECTION_GAP,
  NAMESPACE_STYLE_PANE_SECTION_PADDING,
} from "../../../../config/editorUiConfig";
import ValidationPopup from "../../../../ui/ValidationPopup/ValidationPopup";
import ColorSelector from "../../../../ui/ColorSelector/ColorSelector";
import ControlButton from "../../../../ui/ControlButton/ControlButton";
import {
  BorderIcon,
  DeleteIcon,
  FillIcon,
  GenerateIcon,
  TextColorIcon,
} from "../../../../ui/icons/icons";
import type { NamespaceView } from "../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./NamespaceStylePane.module.css";

type NamespaceStylePaneProps = {
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

export default function NamespaceStylePane({
  view,
  onNamespaceRenameCommitted,
}: NamespaceStylePaneProps): ReactElement {
  // State creation: local state - namespace name draft and validation messages
  const [nameDraft, setNameDraft] = useState(view.label);
  const [errors, setErrors] = useState<readonly string[]>([]);
  const nameSettledRef = useRef(false);

  // State reconciliation
  useEffect(() => {
    setNameDraft(view.label);
    setErrors([]);
    nameSettledRef.current = false;
  }, [view.label, view.namespaceId]);

  // UI props derivation
  const paneVars = {
    "--namespace-style-pane-section-padding": `${NAMESPACE_STYLE_PANE_SECTION_PADDING}px`,
    "--namespace-style-pane-section-gap": `${NAMESPACE_STYLE_PANE_SECTION_GAP}px`,
    "--namespace-style-pane-field-gap": `${NAMESPACE_STYLE_PANE_FIELD_GAP}px`,
    "--namespace-style-pane-control-gap": `${NAMESPACE_STYLE_PANE_CONTROL_GAP}px`,
    "--namespace-style-pane-input-padding": `${NAMESPACE_STYLE_PANE_INPUT_PADDING_Y}px ${NAMESPACE_STYLE_PANE_INPUT_PADDING_X}px`,
    "--namespace-style-pane-font-size": `${NAMESPACE_STYLE_PANE_FONT_SIZE}px`,
    "--namespace-style-pane-input-radius": `${NAMESPACE_STYLE_PANE_INPUT_RADIUS}px`,
    "--namespace-style-pane-input-border-width": `${NAMESPACE_STYLE_PANE_INPUT_BORDER_WIDTH}px`,
    "--namespace-style-pane-input-min-width": `${NAMESPACE_STYLE_PANE_INPUT_MIN_WIDTH}px`,
  } as CSSProperties;
  const style = view.style ?? EMPTY_STYLE_PROPERTIES;

  // Event handler props derivation
  const {
    onNameDraftChange,
    onNameSubmit,
    onNameKeyDown,
    onValidationDismiss,
    onFillChange,
    onStrokeChange,
    onTextColorChange,
    onStrokeWidthChange,
    onStrokeDasharrayChange,
    onStyleReset,
    onNamespaceDelete,
  } = useInteractions({
    view,
    nameDraft,
    setNameDraft,
    setErrors,
    nameSettledRef,
    onNamespaceRenameCommitted,
  });
  const stylePropertyHandlers = {
    fill: onFillChange,
    stroke: onStrokeChange,
    color: onTextColorChange,
    strokeWidth: onStrokeWidthChange,
    strokeDasharray: onStrokeDasharrayChange,
  } satisfies Record<StylePropertyName, (value: string | null) => void>;

  return (
    <section className={styles.panel} style={paneVars} aria-label="Namespace styles">
      <section className={styles.section} aria-label="Namespace name">
        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input
            value={nameDraft}
            onChange={(event) => onNameDraftChange(event.currentTarget.value)}
            onBlur={onNameSubmit}
            onKeyDown={onNameKeyDown}
          />
        </label>
        {errors.length > 0 ? (
          <ValidationPopup messages={errors} onDismiss={onValidationDismiss} />
        ) : null}
      </section>

      <section className={styles.section} aria-label="Namespace style">
        {STYLE_PROPERTIES.map(({ name }) =>
          isColorProperty(name) ? (
            <ColorSelector
              key={name}
              label={toPropertyLabel(name)}
              icon={toPropertyIcon(name)}
              displayValue={toDisplayValue(style, name)}
              pickerValue={toPickerValue(style[name])}
              swatchColor={style[name] ?? toDefaultColor(name)}
              onChange={stylePropertyHandlers[name]}
            />
          ) : (
            <label key={name} className={styles.field}>
              <span className={styles.label}>{toPropertyLabel(name)}</span>
              <input
                value={style[name] ?? ""}
                placeholder={toTextPlaceholder(name)}
                onChange={(event) =>
                  stylePropertyHandlers[name](event.currentTarget.value.trim() || null)
                }
              />
            </label>
          )
        )}
        <ControlButton
          label="Reset style"
          icon={<GenerateIcon />}
          variant="label"
          onClick={onStyleReset}
        />
      </section>

      <section className={styles.section} aria-label="Namespace controls">
        <ControlButton
          label="Delete"
          icon={<DeleteIcon />}
          variant="label"
          tone="danger"
          onClick={onNamespaceDelete}
        />
      </section>
    </section>
  );
}

// Private helpers
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

function toPropertyIcon(property: StylePropertyName): ReactElement {
  switch (property) {
    case "fill":
      return <FillIcon />;
    case "stroke":
      return <BorderIcon />;
    case "color":
      return <TextColorIcon />;
    case "strokeWidth":
    case "strokeDasharray":
      return <BorderIcon />;
  }
}

function toDisplayValue(style: StyleProperties, property: StylePropertyName): string {
  return style[property] ?? toDefaultValue(property);
}

function toDefaultValue(property: StylePropertyName): string {
  switch (property) {
    case "fill":
      return NAMESPACE_DEFAULT_FILL;
    case "stroke":
      return NAMESPACE_DEFAULT_STROKE;
    case "strokeWidth":
      return `${NAMESPACE_DEFAULT_STROKE_WIDTH}px`;
    case "strokeDasharray":
      return "solid";
    case "color":
      return "default";
  }
}

function toTextPlaceholder(property: StylePropertyName): string {
  return property === "strokeWidth" ? `${NAMESPACE_DEFAULT_STROKE_WIDTH}px` : "solid";
}

function toDefaultColor(property: StylePropertyName): string {
  switch (property) {
    case "fill":
      return NAMESPACE_STYLE_PANE_COLOR_PICKER_FALLBACK;
    case "stroke":
      return NAMESPACE_DEFAULT_STROKE;
    case "color":
      return NAMESPACE_STYLE_PANE_COLOR_PICKER_FALLBACK;
    case "strokeWidth":
    case "strokeDasharray":
      return NAMESPACE_STYLE_PANE_COLOR_PICKER_FALLBACK;
  }
}

function toPickerValue(value: string | null): string {
  return value && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : NAMESPACE_STYLE_PANE_COLOR_PICKER_FALLBACK;
}
