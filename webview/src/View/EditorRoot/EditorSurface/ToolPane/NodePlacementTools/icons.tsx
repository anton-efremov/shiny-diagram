/**
 * @render UML class element tool glyphs.
 */

import type { ReactElement } from "react";

type NodeGlyphProps = {
  readonly children: ReactElement;
};

function NodeGlyph({ children }: NodeGlyphProps): ReactElement {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ClassGlyph(): ReactElement {
  return (
    <NodeGlyph>
      <path d="M2.5 2.5h11v11h-11ZM2.5 6.5h11M2.5 10h11" />
    </NodeGlyph>
  );
}

export function NamespaceGlyph(): ReactElement {
  return (
    <NodeGlyph>
      <path d="M2.5 3h11v10h-11ZM4.5 5.5h3v2.5h-3ZM8.5 8.5h3v2.5h-3Z" />
    </NodeGlyph>
  );
}

export function NoteGlyph(): ReactElement {
  return (
    <NodeGlyph>
      <path d="M3 2.5h7l3 3v8h-10ZM10 2.5v3h3" />
    </NodeGlyph>
  );
}
