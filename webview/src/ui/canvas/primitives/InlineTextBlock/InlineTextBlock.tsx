/**
 * Non-editable text on a canvas surface.
 *
 * Renders the text (`text`) exactly where its editable counterpart appears,
 * so swapping display for editing does not shift a pixel. Clicking asks to
 * edit (`onEditRequest`) — the element only requests; opening an editor is
 * the consumer's decision.
 *
 * Modifiers:
 * - `variant` — what is rendered:
 *   - `primary` renders one prominent centered line and ellipsizes overflow.
 *     Used by: class titles
 *   - `secondary` renders one small line and ellipsizes overflow. Used by: class
 *     stereotypes and aliases
 *   - `heading` renders one medium left-aligned line and ellipsizes overflow.
 *     Used by: namespace headings
 *   - `body` fills its container with multiline text, wrapping anywhere and
 *     clipping text past the bottom. Used by: note bodies
 *   - `row` renders compact padded text that wraps. Used by: class-member rows
 */

import type { MouseEvent, ReactElement } from "react";
import styles from "./InlineTextBlock.module.css";

type InlineTextBlockProps = {
  readonly text: string;
  readonly variant: "primary" | "secondary" | "heading" | "body" | "row";
  readonly onEditRequest: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function InlineTextBlock({
  text,
  variant,
  onEditRequest,
}: InlineTextBlockProps): ReactElement {
  const title = variant === "primary" || variant === "row" ? text : undefined;

  return (
    <div
      className={`${styles.text} ${styles[variant]}`}
      title={title}
      onClick={onEditRequest}
      onDoubleClick={onEditRequest}
    >
      {text}
    </div>
  );
}
