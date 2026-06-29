/**
 * @role [P]
 * @presents Class style color controls.
 */

import type { ReactElement } from "react";
import ColorSelector from "../../../../../ui/ColorSelector/ColorSelector";
import { BorderIcon, FillIcon, TextColorIcon } from "../../../../../ui/icons/icons";
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
  readonly text: StyleColorControlProps;
  readonly onFillColorChange: (fill: string) => void;
  readonly onBorderColorChange: (border: string) => void;
  readonly onTextColorChange: (color: string) => void;
};

export default function ClassStyleControls({
  fill,
  border,
  text,
  onFillColorChange,
  onBorderColorChange,
  onTextColorChange,
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
      <ColorSelector label="Text" icon={<TextColorIcon />} {...text} onChange={onTextColorChange} />
    </div>
  );
}
