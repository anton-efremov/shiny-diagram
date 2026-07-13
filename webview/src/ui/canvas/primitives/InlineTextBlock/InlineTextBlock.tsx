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
 *   - `primary`   one line of prominent centered text; overflow is cut with
 *                 an ellipsis — e.g. a class title
 *   - `secondary` one line of small text; overflow is cut with an ellipsis
 *                 — e.g. a stereotype or alias under a title
 *   - `heading`   one line of medium left-aligned text; overflow is cut with an
 *                 ellipsis — e.g. a namespace heading
 *   - `body`      multiline text filling its container; wraps anywhere,
 *                 keeps authored line breaks; text past the bottom is cut
 *                 off — e.g. the text of a note
 *   - `row`       compact padded text, small type; wraps — e.g. a member
 *                 row in a class box
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
