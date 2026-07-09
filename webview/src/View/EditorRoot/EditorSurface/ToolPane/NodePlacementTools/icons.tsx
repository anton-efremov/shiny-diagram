/**
 * @render UML class element tool glyphs.
 */

import type { ReactElement } from "react";

export function ClassGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3.5 3.5h13v13h-13zM3.5 7.5h13M3.5 12h13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NamespaceGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M2.5 6.5h5l1.5-2h4.5v2h4v10h-15z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NoteGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 3.5h8.5l3.5 3.5v9.5h-12zM12.5 3.5v3.5h3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
