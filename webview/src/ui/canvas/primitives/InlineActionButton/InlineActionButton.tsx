/**
 * @behavior Prevents field blur before reporting a glyph action.
 */

import type { CSSProperties, ReactElement } from "react";
import type { GlyphDescriptor } from "../../../../shared/glyph";
import styles from "./InlineActionButton.module.css";

type InlineActionButtonProps = {
  readonly glyph: GlyphDescriptor;
  readonly label: string;
  readonly title?: string;
  readonly treatment: "cancel" | "add";
  readonly disabled?: boolean;
  readonly visible?: boolean;
  readonly surface?: string;
  readonly surfaceTone?: "default" | "base" | "neutral";
  readonly onPress: () => void;
};

export default function InlineActionButton({
  glyph,
  label,
  title = label,
  treatment,
  disabled = false,
  visible = true,
  surface,
  surfaceTone = "default",
  onPress,
}: InlineActionButtonProps): ReactElement {
  const style = { "--inline-action-surface": surface } as CSSProperties;
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[treatment]} ${styles[surfaceTone]} ${visible ? "" : styles.hidden}`}
      disabled={disabled}
      style={style}
      aria-label={label}
      title={title}
      onMouseDown={(event) => event.preventDefault()}
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
