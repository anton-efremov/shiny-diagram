/**
 * @render UML relationship tool glyphs.
 */

import type { ReactElement } from "react";

export function AssociationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 40 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 10h28" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DirectedAssociationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 40 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6 10h28M28 5l6 5-6 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BidirectionalAssociationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 40 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6 10h28M12 5l-6 5 6 5M28 5l6 5-6 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DependencyGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 40 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6 10h28"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
      <path
        d="M28 5l6 5-6 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InheritanceGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 40 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 10h22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M28 4.5 35 10l-7 5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RealizationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 40 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6 10h22"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
      <path
        d="M28 4.5 35 10l-7 5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AggregationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 40 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M13 10h21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M6 10 13 5l7 5-7 5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CompositionGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 40 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M13 10h21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 10 13 5l7 5-7 5z" fill="currentColor" />
    </svg>
  );
}
