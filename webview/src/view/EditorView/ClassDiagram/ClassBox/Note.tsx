import type { ReactElement } from "react";
import type { NoteView } from "../../../../controller/deriveViews";

type NoteProps = { view: NoteView };

/**
 * Placeholder for note rendering while note visuals are not implemented.
 */
export default function Note(_props: NoteProps): ReactElement {
  return <></>;
}
