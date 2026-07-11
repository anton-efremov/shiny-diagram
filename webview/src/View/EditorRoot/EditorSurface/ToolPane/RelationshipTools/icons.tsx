/**
 * @render UML relationship tool glyphs.
 */

import type { ReactElement } from "react";

type RelationshipGlyphProps = {
  readonly children: ReactElement | readonly ReactElement[];
};

function RelationshipGlyph({ children }: RelationshipGlyphProps): ReactElement {
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

export function AssociationGlyph(): ReactElement {
  return (
    <RelationshipGlyph>
      <path d="M2 8h12" />
    </RelationshipGlyph>
  );
}

export function DirectedAssociationGlyph(): ReactElement {
  return (
    <RelationshipGlyph>
      <path d="M2 8h12M10 4l4 4-4 4" />
    </RelationshipGlyph>
  );
}

export function BidirectionalAssociationGlyph(): ReactElement {
  return (
    <RelationshipGlyph>
      <path d="M2 8h12M6 4 2 8l4 4M10 4l4 4-4 4" />
    </RelationshipGlyph>
  );
}

export function DependencyGlyph(): ReactElement {
  return (
    <RelationshipGlyph>
      <path d="M2 8h12" strokeDasharray="2 2" />
      <path d="m10 4 4 4-4 4" />
    </RelationshipGlyph>
  );
}

export function InheritanceGlyph(): ReactElement {
  return (
    <RelationshipGlyph>
      <path d="M2 8h7M9 3.5 14 8l-5 4.5Z" />
    </RelationshipGlyph>
  );
}

export function RealizationGlyph(): ReactElement {
  return (
    <RelationshipGlyph>
      <path d="M2 8h7" strokeDasharray="2 2" />
      <path d="M9 3.5 14 8l-5 4.5Z" />
    </RelationshipGlyph>
  );
}

export function AggregationGlyph(): ReactElement {
  return (
    <RelationshipGlyph>
      <path d="M7 8h7M2 8l3-3 3 3-3 3Z" />
    </RelationshipGlyph>
  );
}

export function CompositionGlyph(): ReactElement {
  return (
    <RelationshipGlyph>
      <path d="M7 8h7" />
      <path d="M2 8l3-3 3 3-3 3Z" fill="currentColor" />
    </RelationshipGlyph>
  );
}
