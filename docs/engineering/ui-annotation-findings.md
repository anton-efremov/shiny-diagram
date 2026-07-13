# UI annotation findings

Observations surfaced while writing the UI library's public annotations. These
entries record current behavior and contract friction only; they propose no fix.

## Naming

- **ToggleButton** — The `size` values `nodeTile` and `relationshipTile` encode
  domain vocabulary in a library option, including “relationship” directly.
- **StatusSurfaceFrame** — The `variant` values `error-list` and `code-list` are
  kebab-case while option values elsewhere use camelCase.
- **Button / ReservedBackLink** — `Button.visible` duplicates the
  space-preserving obligation expressed by the `Reserved` prefix without carrying
  that prefix, overlapping the purpose of `ReservedBackLink`.
- **ColorSelect** — The `glyph` modifier uses the data-prop vocabulary reserved
  elsewhere for a `GlyphDescriptor`.
- **EditableEdgeText** — `isEditRequestEnabled` gates edit requests from a single
  click but not from a double-click, so the name overstates the state it controls.
- **EditableTextList** — `isEditStartEnabled` controls three behaviors: editing,
  pointer reordering, and adding. Its name describes only one of them.
- **HullSurfaceFrame** — `onPointerDown` is attached to `onMouseDown`, so its name
  promises a pointer-event boundary while its callback receives no event and
  excludes non-mouse pointer-down semantics.
- **StyledBoxSurfaceFrame** — `connectionEnabled` changes only the cursor; it does
  not enable, disable, or report connection behavior.
- **InlineEmphasisCommitTextField** — The element is named as a text field but
  renders an auto-growing text area, then forces entered line breaks back to one
  line.

## Modeling

- **InlineTextBlock** — Confirmed seed: the `heading` variant owns a fixed-height
  padded strip. That is frame geometry embedded in a text primitive rather than
  arrangement owned by a template.
- **PaneCollapseTab** — The primitive mints its own stacking value instead of
  receiving a composition plane.
- **ValidationPopup** — The chrome primitive mints its own top-layer stacking
  value instead of receiving a composition plane.
- **ColorSelect** — The composite mints a popup stacking value rather than
  receiving its placement plane from composition.
- **StrokeSelect** — The composite mints a popup stacking value rather than
  receiving its placement plane from composition.
- **Dropdown** — The composite mints a menu stacking value rather than receiving
  its placement plane from composition.
- **EdgeTextSurface** — Pill width is estimated from character count using one
  fixed character width. Proportional glyphs can therefore produce excess space
  or extend beyond the estimated surface.
- **InlineActionButton** — `visible={false}` makes the control invisible but
  leaves it focusable and activatable, producing an invisible interactive
  control.
- **GridFrame** — The `workspace`, `canvas`, and `shell` variants frame three
  unrelated compositions under one name; the workspace form arranges the whole
  editor and is arguably outside the canvas wing.

## Contract asymmetry

- **CommitComboBox** — Confirmed seed: changing `disabled` to true does not close
  an already-open menu, and its option buttons remain interactive.
- **CommitTextField / CommitClearableTextField / CommitComboBox /
  InlineCommitTextField / InlineEmphasisCommitTextField / EditableEdgeText** —
  Confirmed seed: `onDiscard` normally means invalid blur and carries validation
  messages, but `EditableEdgeText` exposes a message-free callback and uses it
  for both child discard and cancellation.
- **Dropdown / ColorSelect / StrokeSelect** — The color and stroke selectors close
  on outside pointer press and restore trigger focus; Dropdown closes only on
  selection or Escape while focus remains inside.
- **ValidationPopup / InlineValidationPopup** — Both dismiss on every window
  pointer press, including presses inside the popup. Other popup composites
  distinguish inside interaction from outside dismissal.
- **TextField / InlineTextField** — Chrome and canvas model the same treatment
  axis with different contract shapes: `appearance` plus `situation` in chrome,
  versus `tone` in canvas.
- **InlineCommitTextField** — `display` bundles content, treatment, and an edit
  handler into one object prop instead of exposing the same concerns with the
  surrounding contract's shapes.
- **HullSurfaceFrame / StickyNoteSurfaceFrame / StyledBoxSurfaceFrame** — Canvas
  surface frames report clicks through `onPress`, while chrome elements use
  `onClick` for the same event grammar.

## Open-typed configuration

- **BoxOutline** — `centerOffset` behaves as a geometry modifier but is an open
  CSS-length string, allowing arbitrary treatment values through the contract.
- **ResizeAffordance** — `centerOffset` controls all handle and edge placement but
  is an open CSS-length string rather than closed geometry data.
- **StrokeSelect** — `popupWidth` directly configures presentation width with an
  unrestricted number even though consumers otherwise select presentation
  through closed options.

## Law friction

- **InlineEmphasisCommitTextField** — `initialEmphasis` is runtime content that
  initializes an editable value, but its closed literal type mechanically makes
  it a modifier under the Annotation law and therefore an Options entry.
- **BoxHeaderFrame** — `separatorLineStyle` is mechanically a modifier and must be
  listed under Options, while `separatorColor` and `separatorThickness` are data
  props. The three values form one user-style tuple, so the classification splits
  a single concept across annotation sections.
- **CompartmentStack** — The same separator tuple is split between a closed
  `separatorLineStyle` option and open color/thickness data, producing the same
  annotation strain as BoxHeaderFrame.
- **GridFrame** — The discriminated props union makes `placementActive` legal only
  for the canvas form. A component-level Options list cannot express that scope
  as cleanly as the type does without explanatory prose.
- **FieldGrid** — Each row's `alignment` is a closed modifier nested inside the
  `rows` data catalog. The law defines classification for component props but not
  for modifiers nested inside data entries.
- **Dropdown** — Preview capabilities live on the exported `DropdownOption`
  boundary type, but exported boundary types have no annotation home under the
  current law.
