/**
 * @render UML class element tool glyphs.
 */

import type { ReactElement } from "react";

export function ClassGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 4h12v12h-12zM4 8h12M4 12h12"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NamespaceGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 4.5h12v11h-12zM6.25 7.25h3.25v3h-3.25zM10.5 10.75h3.25v3h-3.25z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NoteGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4.5 3.5h8l3 3v10h-11zM12.5 3.5v3h3"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
    </svg>
  );
}
