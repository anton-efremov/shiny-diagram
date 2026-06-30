/**
 * @render Selected class style preview.
 */

import type { CSSProperties, ReactElement } from "react";
import type { ClassStyleProperties } from "../../../../../../shared/style";
import styles from "./ClassStylePreview.module.css";

type ClassStylePreviewProps =
  | {
      readonly kind: "visible";
      readonly label: string;
      readonly style: ClassStyleProperties;
    }
  | {
      readonly kind: "hidden";
    };

export default function ClassStylePreview(props: ClassStylePreviewProps): ReactElement | null {
  if (props.kind === "hidden") return null;

  const dynamicVars = {
    "--style-fill": props.style.fill,
    "--style-stroke": props.style.stroke,
    "--style-color": props.style.color,
  } as CSSProperties;

  return (
    <div
      className={styles.previewCard}
      style={dynamicVars}
      aria-label="Selected class color preview"
    >
      <div className={styles.previewHeader}>{props.label}</div>
      <div className={styles.previewBody}>Default style</div>
    </div>
  );
}
