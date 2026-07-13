import type { MouseEvent, ReactElement, ReactNode } from "react";
import styles from "./StickyNoteSurfaceFrame.module.css";

type StickyNoteSurfaceFrameProps = {
  readonly title: string;
  readonly dragging: boolean;
  readonly children: ReactNode;
  readonly onPress: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function StickyNoteSurfaceFrame({
  title,
  dragging,
  children,
  onPress,
}: StickyNoteSurfaceFrameProps): ReactElement {
  return (
    <div
      className={`${styles.frame} ${dragging ? styles.dragging : ""}`}
      title={title}
      onClick={onPress}
    >
      {children}
    </div>
  );
}
