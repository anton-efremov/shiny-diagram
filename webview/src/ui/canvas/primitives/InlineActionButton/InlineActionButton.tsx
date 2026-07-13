/**
 * @behavior Prevents field blur before reporting a glyph action.
 */

import type { CSSProperties, ReactElement } from "react";
import { GLYPH_VIEW_BOX, type GlyphDescriptor } from "../../../../shared/glyph";
import {
  GLYPH_COLOR,
  GLYPH_EMPTY_FILL,
  GLYPH_STROKE_LINE_CAP,
  GLYPH_STROKE_LINE_JOIN,
} from "../../tokens";
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
        viewBox={GLYPH_VIEW_BOX}
        fill={glyph.filled ? GLYPH_COLOR : GLYPH_EMPTY_FILL}
        stroke={GLYPH_COLOR}
        strokeLinecap={GLYPH_STROKE_LINE_CAP}
        strokeLinejoin={GLYPH_STROKE_LINE_JOIN}
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
