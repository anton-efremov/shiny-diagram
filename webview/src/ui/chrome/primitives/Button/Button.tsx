/**
 * Button for a labeled command with an optional glyph.
 *
 * Renders `label` beside `icon` when supplied and reports activation through
 * `onClick`.
 *
 * Options:
 * - `disabled` — on shows the command unavailable and prevents activation
 * - `tone` — the command's emphasis:
 *   - `neutral` uses a quiet surface that gains emphasis on hover
 *   - `danger` uses error emphasis that fills on hover
 *   - `accent` uses the primary action surface
 * - `size` — `default` uses the standard command height; `compact` reduces
 *   height, padding, and type size
 * - `shape` — `rounded` uses the control corner; `pill` fully rounds the ends
 * - `alignment` — `stretch` participates at the available width; `end` sizes
 *   to its content at the trailing edge
 * - `visible` — off preserves the command's layout space while removing it
 *   from sight, focus order, and accessibility
 */

import type { ReactElement } from "react";
import { GLYPH_VIEW_BOX, type GlyphDescriptor } from "../../../../shared/glyph";
import {
  GLYPH_COLOR,
  GLYPH_EMPTY_FILL,
  GLYPH_STROKE_LINE_CAP,
  GLYPH_STROKE_LINE_JOIN,
} from "../../tokens";
import styles from "./Button.module.css";

type ButtonProps = {
  readonly label: string;
  readonly icon?: GlyphDescriptor;
  readonly disabled?: boolean;
  readonly tone?: "neutral" | "danger" | "accent";
  readonly size?: "default" | "compact";
  readonly shape?: "rounded" | "pill";
  readonly alignment?: "stretch" | "end";
  readonly visible?: boolean;
  readonly onClick?: () => void;
};

export default function Button({
  label,
  icon,
  disabled = false,
  tone = "neutral",
  size = "default",
  shape = "rounded",
  alignment = "stretch",
  visible = true,
  onClick,
}: ButtonProps): ReactElement {
  const className = [
    tone === "danger"
      ? styles.dangerButton
      : tone === "accent"
        ? styles.accentButton
        : styles.button,
    size === "compact" ? styles.compact : "",
    shape === "pill" ? styles.pill : "",
    alignment === "end" ? styles.endAligned : "",
    visible ? "" : styles.hidden,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || !visible}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      onClick={onClick}
    >
      {icon === undefined ? null : (
        <span className={styles.icon} aria-hidden="true">
          <ButtonGlyph glyph={icon} />
        </span>
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
}

// Private helpers
function ButtonGlyph({ glyph }: { readonly glyph: GlyphDescriptor }): ReactElement {
  return (
    <svg
      className={styles.glyph}
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
          className={glyph.dashed && index === 0 ? styles.dashedGlyphPath : undefined}
          d={path}
        />
      ))}
    </svg>
  );
}
