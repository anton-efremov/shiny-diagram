/**
 * @behavior Reports a glyph toggle and exposes its pressed state.
 */

import type { CSSProperties, ReactElement } from "react";
import type { GlyphDescriptor } from "../../../../shared/glyph";
import styles from "./InlineToggleButton.module.css";

type InlineToggleButtonProps = {
  readonly glyph: GlyphDescriptor;
  readonly label: string;
  readonly pressed: boolean;
  readonly surface?: string;
  readonly surfaceTone?: "default" | "base" | "neutral";
  readonly onPress: () => void;
};

export default function InlineToggleButton({
  glyph,
  label,
  pressed,
  surface,
  surfaceTone = "default",
  onPress,
}: InlineToggleButtonProps): ReactElement {
  const style = { "--inline-toggle-surface": surface } as CSSProperties;
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[surfaceTone]}`}
      style={style}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onPress}
    >
      <svg
        viewBox="0 0 16 16"
        fill={glyph.filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {glyph.paths.map((path, index) => (
          <path
            key={`${index}:${path}`}
            className={glyph.dashed && index === 0 ? styles.dashed : undefined}
            d={path}
          />
        ))}
      </svg>
    </button>
  );
}
