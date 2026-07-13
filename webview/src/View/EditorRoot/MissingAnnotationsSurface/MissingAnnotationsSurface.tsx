/**
 * @behavior Missing spatial annotation command dispatch.
 * @render Missing-annotations editor-state interface.
 */

import type { ReactElement } from "react";
import type { GlyphDescriptor } from "../../../shared/glyph";
import Button from "../../../ui/chrome/primitives/Button/Button";
import StatusSurfaceFrame from "../../../ui/chrome/templates/StatusSurfaceFrame/StatusSurfaceFrame";
import { useInteractions } from "./useInteractions";
import type { EditorViewModel } from "../../views/schema";

type MissingAnnotationsView = Pick<
  Extract<EditorViewModel, { readonly status: "missingAnnotations" }>,
  "missingClassIds" | "diagram"
>;

type MissingAnnotationsSurfaceProps = {
  readonly view: MissingAnnotationsView;
};

const generateGlyph: GlyphDescriptor = {
  paths: [
    "M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2M4.25 4.25l1.4 1.4M10.35 10.35l1.4 1.4M11.75 4.25l-1.4 1.4M5.65 10.35l-1.4 1.4M8 5.75 9.1 8 8 10.25 6.9 8z",
  ],
  filled: false,
  dashed: false,
};

export default function MissingAnnotationsSurface({
  view,
}: MissingAnnotationsSurfaceProps): ReactElement {
  // Event handler props derivation
  const { onGenerate } = useInteractions({ view });

  return (
    <StatusSurfaceFrame
      status={
        <>
          ⚠ Missing annotations
          <Button icon={generateGlyph} label="Generate" onClick={onGenerate} />
        </>
      }
      label="Classes without spatial annotations:"
      items={view.missingClassIds}
      variant="codeList"
    />
  );
}
