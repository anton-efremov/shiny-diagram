import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from "react";
import styles from "./StyledBoxSurfaceFrame.module.css";

type StyledBoxSurfaceFrameProps = {
  readonly title: string;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: string;
  readonly lineStyle: "solid" | "dashed" | "dotted";
  readonly color?: string;
  readonly dragging: boolean;
  readonly connectionEnabled: boolean;
  readonly children: ReactNode;
  readonly onPress: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function StyledBoxSurfaceFrame({
  title,
  fill,
  stroke,
  strokeWidth,
  lineStyle,
  color,
  dragging,
  connectionEnabled,
  children,
  onPress,
}: StyledBoxSurfaceFrameProps): ReactElement {
  const style = {
    "--styled-box-fill": fill,
    "--styled-box-stroke": stroke,
    "--styled-box-stroke-width": strokeWidth,
    "--styled-box-line-style": lineStyle,
    "--styled-box-color": color,
  } as CSSProperties;
  const className = [
    styles.frame,
    dragging ? styles.dragging : "",
    connectionEnabled ? styles.connectionEnabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} style={style} title={title} onClick={onPress}>
      {children}
    </div>
  );
}
