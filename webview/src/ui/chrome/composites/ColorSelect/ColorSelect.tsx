/**
 * Color selector with a swatch-grid popup and immediate selection.
 *
 * Shows `value` through the selected `preview`; null uses the `baseValue` preview
 * and "multiple" shows a mixed state. The popup combines `documentColors` with
 * the hue, shade, and neutral `presets`; choosing a color or Base reports
 * `onChange` and returns focus to the control. Closing it without choosing —
 * clicking outside or from the keyboard — reports nothing. The six-column grid
 * is keyboard-navigable, and the popup paints at the supplied `stacking` plane.
 *
 * Lifecycle:
 * - `disabled` — on means the list cannot be opened and shows the control as
 *   unavailable
 *
 * Modifiers:
 * - `preview` — the selected color's sample:
 *   - `fill` renders a filled square. Used by: fill-color properties
 *   - `stroke` renders a line. Used by: outline-color properties
 *   - `text` renders a letter sample. Used by: text-color properties
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactElement } from "react";
import styles from "./ColorSelect.module.css";

/**
 * Named color entry offered by ColorSelect.
 *
 * `name` labels the entry and `value` supplies the color reported when it is
 * chosen.
 */
export type ColorSelectPreset = {
  readonly name: string;
  readonly value: string;
};

/**
 * Grouped preset catalog arranged for ColorSelect's palette.
 *
 * `hues` supplies named three-shade groups, while `neutrals` supplies the
 * ungrouped neutral entries.
 */
export type ColorSelectPresetCatalog = {
  readonly hues: readonly {
    readonly name: string;
    readonly shades: readonly [ColorSelectPreset, ColorSelectPreset, ColorSelectPreset];
  }[];
  readonly neutrals: readonly ColorSelectPreset[];
};

type ColorSelectProps = {
  readonly value: string | null | "multiple";
  readonly presets: ColorSelectPresetCatalog;
  readonly documentColors: readonly string[];
  readonly baseValue?: string;
  readonly stacking: number;
  readonly disabled?: boolean;
  readonly preview: "fill" | "stroke" | "text";
  readonly onChange: (value: string | null) => void;
};

const PALETTE_COLUMN_COUNT = 6;
const POPUP_MIN_WIDTH = 164;
const VIEWPORT_GUTTER = 8;

export default function ColorSelect({
  preview,
  value,
  presets,
  documentColors,
  baseValue,
  stacking,
  disabled = false,
  onChange,
}: ColorSelectProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [paletteFocusIndex, setPaletteFocusIndex] = useState(0);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: VIEWPORT_GUTTER,
    width: POPUP_MIN_WIDTH,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const paletteRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const palette = toPalette(presets);
  const isMultiple = value === "multiple";

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const width = Math.max(rect.width, POPUP_MIN_WIDTH);
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
  }, [isOpen]);

  function closeAndRestoreFocus(): void {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function selectValue(nextValue: string | null): void {
    onChange(nextValue);
    closeAndRestoreFocus();
  }

  function openPopup(): void {
    if (isOpen) {
      closeAndRestoreFocus();
      return;
    }
    setPaletteFocusIndex(0);
    setIsOpen(true);
    requestAnimationFrame(() => paletteRefs.current[0]?.focus());
  }

  function movePaletteFocus(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    const rowCount = Math.ceil(palette.length / PALETTE_COLUMN_COUNT);
    const row = Math.floor(index / PALETTE_COLUMN_COUNT);
    const column = index % PALETTE_COLUMN_COUNT;
    let nextIndex = index;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = Math.min(index + 1, palette.length - 1);
        break;
      case "ArrowLeft":
        nextIndex = Math.max(index - 1, 0);
        break;
      case "ArrowDown":
        nextIndex = Math.min(
          Math.min(row + 1, rowCount - 1) * PALETTE_COLUMN_COUNT + column,
          palette.length - 1
        );
        break;
      case "ArrowUp":
        nextIndex = Math.min(
          Math.max(row - 1, 0) * PALETTE_COLUMN_COUNT + column,
          palette.length - 1
        );
        break;
      case "Home":
        nextIndex = row * PALETTE_COLUMN_COUNT;
        break;
      case "End":
        nextIndex = Math.min((row + 1) * PALETTE_COLUMN_COUNT - 1, palette.length - 1);
        break;
      default:
        return;
    }

    event.preventDefault();
    paletteRefs.current[nextIndex]?.focus();
    setPaletteFocusIndex(nextIndex);
  }

  const popupStyle = {
    "--color-select-popup-top": `${popupPosition.top}px`,
    "--color-select-popup-left": `${popupPosition.left}px`,
    "--color-select-popup-width": `${popupPosition.width}px`,
    zIndex: stacking,
  } as CSSProperties;

  return (
    <div className={styles.colorSelect}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        disabled={disabled}
        aria-haspopup="grid"
        aria-expanded={isOpen}
        onClick={openPopup}
      >
        <ColorPreview preview={preview} value={value} emphasized={value !== null && !isMultiple} />
        <span className={styles.arrow} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div ref={popupRef} className={styles.popup} style={popupStyle}>
          {documentColors.length > 0 ? (
            <section className={styles.section} aria-label="In this diagram">
              <span className={styles.heading}>In this diagram</span>
              <div className={styles.documentGrid} role="grid">
                {documentColors.map((color) => (
                  <ColorOption
                    key={color}
                    value={color}
                    selected={!isMultiple && colorsEqual(color, value)}
                    onSelect={selectValue}
                  />
                ))}
              </div>
            </section>
          ) : null}
          <button
            type="button"
            className={styles.defaultOption}
            aria-pressed={!isMultiple && value === null}
            onClick={() => selectValue(null)}
          >
            <span
              className={`${styles.defaultSwatch} ${styles[preview]}`}
              style={{ "--color-select-value": baseValue } as CSSProperties}
              aria-hidden="true"
            />
            <span>{!baseValue || isTokenValue(baseValue) ? "Base" : `Base ${baseValue}`}</span>
          </button>
          <div className={styles.divider} />
          <div className={styles.paletteGrid} role="grid" aria-label="Preset colors">
            {palette.map((preset, index) => (
              <ColorOption
                key={preset.value}
                value={preset.value}
                label={preset.name}
                selected={!isMultiple && colorsEqual(preset.value, value)}
                tabIndex={index === paletteFocusIndex ? 0 : -1}
                buttonRef={(element) => {
                  paletteRefs.current[index] = element;
                }}
                onKeyDown={(event) => movePaletteFocus(event, index)}
                onFocus={() => setPaletteFocusIndex(index)}
                onSelect={selectValue}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ColorPreview({
  preview,
  value,
  emphasized,
}: {
  readonly preview: ColorSelectProps["preview"];
  readonly value: ColorSelectProps["value"];
  readonly emphasized: boolean;
}): ReactElement {
  const dynamicStyle = {
    "--color-select-value": value === null || value === "multiple" ? undefined : value,
  } as CSSProperties;
  const className = [
    styles.glyph,
    styles[preview],
    value === "multiple" ? styles.multiple : "",
    emphasized ? styles.emphasized : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={className} style={dynamicStyle} aria-hidden="true">
      {preview === "text" ? "A" : null}
    </span>
  );
}

function ColorOption({
  value,
  label,
  selected,
  buttonRef,
  tabIndex,
  onKeyDown,
  onFocus,
  onSelect,
}: {
  readonly value: string;
  readonly label?: string;
  readonly selected: boolean;
  readonly buttonRef?: (element: HTMLButtonElement | null) => void;
  readonly tabIndex?: number;
  readonly onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  readonly onFocus?: () => void;
  readonly onSelect: (value: string) => void;
}): ReactElement {
  const dynamicStyle = { "--color-select-value": value } as CSSProperties;
  return (
    <button
      ref={buttonRef}
      type="button"
      role="gridcell"
      className={styles.colorOption}
      style={dynamicStyle}
      aria-label={label ?? value}
      aria-pressed={selected}
      title={label}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onClick={() => onSelect(value)}
    />
  );
}

function toPalette(presets: ColorSelectPresetCatalog): readonly ColorSelectPreset[] {
  const shadeRows = [0, 1, 2] as const;
  return [
    ...shadeRows.flatMap((shade) => presets.hues.map((family) => family.shades[shade])),
    ...presets.neutrals,
  ];
}

function colorsEqual(left: string, right: ColorSelectProps["value"]): boolean {
  if (right === null || right === "multiple") return false;
  return normalizeColor(left) === normalizeColor(right);
}

function normalizeColor(value: string): string {
  const normalized = value.trim().toLowerCase();
  const shortHex = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(normalized);
  return shortHex
    ? `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`
    : normalized;
}

function isTokenValue(value: string): boolean {
  return value.startsWith("var(");
}
