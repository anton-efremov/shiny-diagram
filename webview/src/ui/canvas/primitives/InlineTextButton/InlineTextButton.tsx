/**
 * Inline text button for a compact momentary action.
 *
 * Renders `label` as its content; clicking it reports `onPress`.
 */

import type { ReactElement } from "react";
import styles from "./InlineTextButton.module.css";

type InlineTextButtonProps = {
  readonly label: string;
  readonly onPress: () => void;
};

export default function InlineTextButton({ label, onPress }: InlineTextButtonProps): ReactElement {
  return (
    <button type="button" className={styles.button} onClick={onPress}>
      {label}
    </button>
  );
}
