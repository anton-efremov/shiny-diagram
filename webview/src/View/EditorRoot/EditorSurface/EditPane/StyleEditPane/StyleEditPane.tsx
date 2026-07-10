/**
 * @behavior Named style editor section routing.
 * @render Named style inspector sections.
 */

import type { ReactElement } from "react";
import type { StyleView } from "../../../../views/schema";
import Button from "../../../../ui/primitives/Button/Button";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";
import ControlGroup from "../../../../ui/templates/ControlGroup/ControlGroup";
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
      <PaneSection label="Selected style">
        <StyleNameEditor view={view} styles={styleViews} />
      </PaneSection>
      <PaneSection label="Configure named style">
        <ChangeStylePalette view={view} />
      </PaneSection>
      <PaneSection label="Actions">
        <ControlGroup columns={2}>
          <Button label="Rename style" disabled />
          <Button label="Delete style" tone="danger" onClick={onDelete} />
        </ControlGroup>
      </PaneSection>
    </>
  );
}
