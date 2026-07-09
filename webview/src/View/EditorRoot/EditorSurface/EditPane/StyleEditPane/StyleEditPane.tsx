/**
 * @behavior Named style editor section routing.
 * @render Named style inspector sections.
 */

import type { ReactElement } from "react";
import type { StyleView } from "../../../../views/schema";
import Button from "../../../../ui/primitives/Button/Button";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";
import ChangeStylePalette from "./ChangeStylePalette/ChangeStylePalette";
import StyleNameEditor from "./StyleNameEditor/StyleNameEditor";
import { useInteractions } from "./useInteractions";

type StyleEditPaneProps = {
  readonly view: StyleView;
  readonly styles: readonly StyleView[];
};

export default function StyleEditPane({
  view,
  styles: styleViews,
}: StyleEditPaneProps): ReactElement {
  // Event handler props derivation
  const { onDelete } = useInteractions(view);

  return (
    <>
      <PaneSection label="Style name">
        <StyleNameEditor view={view} styles={styleViews} />
      </PaneSection>
      <PaneSection label="Change style">
        <ChangeStylePalette view={view} />
      </PaneSection>
      <PaneSection label="">
        <Button label="Delete style" tone="danger" onClick={onDelete} />
      </PaneSection>
    </>
  );
}
