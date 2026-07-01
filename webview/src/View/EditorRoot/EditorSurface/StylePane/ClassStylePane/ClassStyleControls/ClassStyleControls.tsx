/**
 * @render Class style color controls.
 */

import type { ReactElement } from "react";
import ColorSelector from "../../../../../ui/ColorSelector/ColorSelector";
import { BorderIcon, FillIcon } from "../../../../../ui/icons/icons";
import styles from "./ClassStyleControls.module.css";

type StyleColorControlProps = {
  readonly displayValue: string;
  readonly pickerValue: string;
  readonly swatchColor?: string;
  readonly mixed: boolean;
};

type ClassStyleControlsProps = {
  readonly fill: StyleColorControlProps;
  readonly border: StyleColorControlProps;
  readonly onFillColorChange: (fill: string) => void;
  readonly onBorderColorChange: (border: string) => void;
};

export default function ClassStyleControls({
  fill,
  border,
  onFillColorChange,
  onBorderColorChange,
}: ClassStyleControlsProps): ReactElement {
  return (
    <div className={styles.styleList}>
      <ColorSelector label="Fill" icon={<FillIcon />} {...fill} onChange={onFillColorChange} />
      <ColorSelector
        label="Border"
        icon={<BorderIcon />}
        {...border}
        onChange={onBorderColorChange}
      />
    </div>
  );
}
