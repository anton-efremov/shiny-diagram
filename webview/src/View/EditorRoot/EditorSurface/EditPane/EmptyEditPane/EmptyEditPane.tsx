/**
 * @render Empty edit pane section placeholder.
 */

import type { ReactElement } from "react";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";

export default function EmptyEditPane(): ReactElement {
  return <PaneSection label="" />;
}
