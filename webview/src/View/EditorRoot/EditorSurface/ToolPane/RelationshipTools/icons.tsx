/**
 * @render UML relationship tool glyphs.
 */

import type { ReactElement } from "react";

export function AssociationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M5 10h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function DirectedAssociationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M5 10h18M18 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BidirectionalAssociationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M5 10h18M10 5l-5 5 5 5M18 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DependencyGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M5 10h18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
      <path
        d="M18 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InheritanceGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M5 10h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M18 4.5 24 10l-6 5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RealizationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M5 10h13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
      <path
        d="M18 4.5 24 10l-6 5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AggregationGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M11 10h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M4 10 10 5l6 5-6 5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CompositionGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M11 10h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 10 10 5l6 5-6 5z" fill="currentColor" />
    </svg>
  );
}
