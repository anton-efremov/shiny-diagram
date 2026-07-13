/**
 * Line-treatment selector with sampled values and immediate selection.
 *
 * Shows `value`, using `defaultValue` for Base or the preview when values are
 * mixed. The popup orders Base, unused `presets`, then `documentValues`, treating
 * equivalent representations as equal. Choosing a row reports `onChange`, where
 * Base reports null, then returns focus to the control. Closing it without
 * choosing — clicking outside or from the keyboard — reports nothing; the row
 * list is keyboard-navigable. `popupWidth` sets the popup's minimum width before
 * viewport clamping, and the popup paints at the supplied `stacking` plane.
 *
 * Lifecycle:
 * - `disabled` — on means the list cannot be opened and shows the control as
 *   unavailable. Used by: no current product situation
 *
 * Modifiers:
 * - `kind` — `width` varies the sample's thickness; `dash` varies its pattern
 *   Used by: outline width and dash controls
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactElement } from "react";
import styles from "./StrokeSelect.module.css";

type StrokeSelectProps = {
  readonly value: string | null | "multiple";
  readonly defaultValue: string;
  readonly presets: readonly string[];
  readonly documentValues: readonly string[];
  readonly popupWidth?: number;
  readonly stacking: number;
  readonly disabled?: boolean;
  readonly kind: "width" | "dash";
  readonly onChange: (value: string | null) => void;
};

const VIEWPORT_GUTTER = 8;

export default function StrokeSelect({
  kind,
  value,
  defaultValue,
  presets,
  documentValues,
  popupWidth = 148,
  stacking,
  disabled = false,
  onChange,
}: StrokeSelectProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: VIEWPORT_GUTTER,
    width: popupWidth,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const standardValues = presets.filter(
    (preset) =>
      !documentValues.some(
        (documentValue) => normalizeValue(kind, documentValue) === normalizeValue(kind, preset)
      )
  );
  const options = [null, ...standardValues, ...documentValues] as const;
  const isMultiple = value === "multiple";

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const width = Math.max(rect.width, popupWidth);
      const left = Math.max(
        VIEWPORT_GUTTER,
        Math.min(rect.left, window.innerWidth - width - VIEWPORT_GUTTER)
      );
      setPopupPosition({ top: rect.bottom + 4, left, width });
    }

    function closeFromPointer(event: PointerEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      closeAndRestoreFocus();
    }

    function closeFromEscape(event: globalThis.KeyboardEvent): void {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeAndRestoreFocus();
    }

    document.addEventListener("pointerdown", closeFromPointer);
    document.addEventListener("keydown", closeFromEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromPointer);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [isOpen, popupWidth]);

  function closeAndRestoreFocus(): void {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function selectValue(nextValue: string | null): void {
    onChange(nextValue);
    closeAndRestoreFocus();
  }

  function togglePopup(): void {
    if (isOpen) {
      closeAndRestoreFocus();
      return;
    }
    setFocusIndex(0);
    setIsOpen(true);
    requestAnimationFrame(() => optionRefs.current[0]?.focus());
  }

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    let nextIndex = index;
    switch (event.key) {
      case "ArrowDown":
        nextIndex = Math.min(index + 1, options.length - 1);
        break;
      case "ArrowUp":
        nextIndex = Math.max(index - 1, 0);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setFocusIndex(nextIndex);
    optionRefs.current[nextIndex]?.focus();
  }

  const popupStyle = {
    "--stroke-select-popup-top": `${popupPosition.top}px`,
    "--stroke-select-popup-left": `${popupPosition.left}px`,
    "--stroke-select-popup-width": `${popupPosition.width}px`,
    zIndex: stacking,
  } as CSSProperties;
  const triggerValue = value === null || isMultiple ? defaultValue : value;

  return (
    <div className={styles.strokeSelect}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={togglePopup}
      >
        <LineSample kind={kind} value={triggerValue} multiple={isMultiple} />
        <span className={styles.arrow} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div ref={popupRef} className={styles.popup} style={popupStyle} role="listbox">
          <span className={styles.heading}>Base</span>
          <StrokeOption
            kind={kind}
            value={defaultValue}
            selected={!isMultiple && value === null}
            tabIndex={focusIndex === 0 ? 0 : -1}
            buttonRef={(element) => {
              optionRefs.current[0] = element;
            }}
            onFocus={() => setFocusIndex(0)}
            onKeyDown={(event) => moveFocus(event, 0)}
            onSelect={() => selectValue(null)}
          />
          <span className={styles.heading}>Standard</span>
          {standardValues.map((preset, index) => {
            const optionIndex = index + 1;
            return (
              <StrokeOption
                key={preset}
                kind={kind}
                value={preset}
                selected={!isMultiple && valuesEqual(kind, preset, value)}
                tabIndex={focusIndex === optionIndex ? 0 : -1}
                buttonRef={(element) => {
                  optionRefs.current[optionIndex] = element;
                }}
                onFocus={() => setFocusIndex(optionIndex)}
                onKeyDown={(event) => moveFocus(event, optionIndex)}
                onSelect={() => selectValue(preset)}
              />
            );
          })}
          {documentValues.length > 0 ? (
            <>
              <span className={styles.heading}>In this diagram</span>
              {documentValues.map((documentValue, index) => {
                const optionIndex = standardValues.length + index + 1;
                return (
                  <StrokeOption
                    key={documentValue}
                    kind={kind}
                    value={documentValue}
                    selected={!isMultiple && valuesEqual(kind, documentValue, value)}
                    tabIndex={focusIndex === optionIndex ? 0 : -1}
                    buttonRef={(element) => {
                      optionRefs.current[optionIndex] = element;
                    }}
                    onFocus={() => setFocusIndex(optionIndex)}
                    onKeyDown={(event) => moveFocus(event, optionIndex)}
                    onSelect={() => selectValue(documentValue)}
                  />
                );
              })}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StrokeOption({
  kind,
  value,
  selected,
  tabIndex,
  buttonRef,
  onFocus,
  onKeyDown,
  onSelect,
}: {
  readonly kind: StrokeSelectProps["kind"];
  readonly value: string;
  readonly selected: boolean;
  readonly tabIndex: number;
  readonly buttonRef: (element: HTMLButtonElement | null) => void;
  readonly onFocus: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  readonly onSelect: () => void;
}): ReactElement {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="option"
      className={styles.option}
      aria-selected={selected}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onClick={onSelect}
    >
      <LineSample kind={kind} value={value} multiple={false} />
      <span className={styles.literal}>{toDisplayValue(kind, value)}</span>
    </button>
  );
}

function LineSample({
  kind,
  value,
  multiple,
}: {
  readonly kind: StrokeSelectProps["kind"];
  readonly value: string;
  readonly multiple: boolean;
}): ReactElement {
  return (
    <svg
      className={multiple ? styles.multipleSample : styles.sample}
      viewBox="0 0 120 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 8h116"
        stroke="currentColor"
        strokeWidth={kind === "width" ? value : "2"}
        strokeDasharray={kind === "dash" && normalizeValue(kind, value) !== "0" ? value : undefined}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Private helpers
function valuesEqual(
  kind: StrokeSelectProps["kind"],
  left: string,
  right: StrokeSelectProps["value"]
): boolean {
  return (
    right !== null &&
    right !== "multiple" &&
    normalizeValue(kind, left) === normalizeValue(kind, right)
  );
}

function normalizeValue(kind: StrokeSelectProps["kind"], value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (kind === "dash") return normalized === "none" || normalized === "" ? "0" : normalized;
  const numeric = Number.parseFloat(normalized);
  return Number.isNaN(numeric) ? normalized : String(numeric);
}

function toDisplayValue(kind: StrokeSelectProps["kind"], value: string): string {
  return kind === "dash" && normalizeValue(kind, value) === "0" ? "0" : value;
}
