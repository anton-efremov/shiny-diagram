/**
 * @behavior Toggle button press indication and click routing.
 * @render Shared icon toggle button.
 */

import type { ReactElement } from "react";
import type { GlyphDescriptor } from "../../../../shared/glyph";
import styles from "./ToggleButton.module.css";

type ToggleButtonProps = {
  readonly icon?: GlyphDescriptor;
  readonly label?: string;
  readonly title: string;
  readonly pressed: boolean;
  readonly disabled?: boolean;
  readonly size?: "micro" | "compact" | "nodeTile" | "relationshipTile";
  readonly onClick?: () => void;
};

export default function ToggleButton({
  icon,
  label,
  title,
  pressed,
  disabled = false,
  size = "compact",
  onClick,
}: ToggleButtonProps): ReactElement {
  const className =
    size === "micro"
      ? styles.microButton
      : size === "nodeTile"
        ? styles.nodeTileButton
        : size === "relationshipTile"
          ? styles.relationshipTileButton
          : label === undefined
            ? styles.iconOnlyButton
            : styles.labeledButton;

  return (
    <button
      type="button"
      className={className}
      aria-label={label === undefined ? title : undefined}
      aria-pressed={pressed}
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      {icon === undefined ? null : (
        <span className={styles.icon} aria-hidden="true">
          <ToggleButtonGlyph glyph={icon} />
        </span>
      )}
      {label === undefined ? null : <span className={styles.label}>{label}</span>}
    </button>
  );
}

// Private helpers
function ToggleButtonGlyph({ glyph }: { readonly glyph: GlyphDescriptor }): ReactElement {
  return (
    <svg
      className={styles.glyph}
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
          className={glyph.dashed && index === 0 ? styles.dashedGlyphPath : undefined}
          d={path}
        />
      ))}
    </svg>
  );
}
