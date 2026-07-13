/**
 * @render Canvas display-state text.
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
