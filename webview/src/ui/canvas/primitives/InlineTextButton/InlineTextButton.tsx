/**
 * @behavior Reports a compact text action.
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
