# UI annotation findings

Observations surfaced while writing the UI library's public annotations. These
entries record current behavior and contract friction only; they propose no fix.

## Naming

- **ToggleButton — Closed (Brief 8, Task 4).** The domain-bearing `size` values
  were replaced by the situational `labeledTile` and `glyphTile` provisions.
- **StatusSurfaceFrame — Closed (Brief 8, Task 4).** The `variant` values are now
  camelCase: `errorList` and `codeList`.
- **Button / ReservedBackLink — Closed (Brief 9, Task 2 review decision).**
  `NoteEditPane` needs `Button.visible` to keep attachment-section geometry
  stable; the `Reserved` prefix names elements whose whole identity is
  space-keeping, while an option may provide the behavior without the prefix.
- **ColorSelect — Closed (Brief 8, Task 4).** The ambiguous `glyph` modifier is
  now named `preview`.
- **EditableEdgeText — Closed (Brief 9, Task 5).** The gate is now
  `isClickEditEnabled`, naming the single-click path it controls without implying
  that double-click editing is disabled.
- **EditableTextList — Closed (Brief 9, Task 5).** The provision is now
  `isEditable`, covering editing, reordering, and adding as row mutations.
- **HullSurfaceFrame — Closed (Brief 9, Task 5).** The mouse-start notification is
  now `onPressStart`, preserving its event-free mouse behavior without promising
  pointer-event semantics.
- **StyledBoxSurfaceFrame — Closed (Brief 9, Task 5).** The cursor-only provision
  is now `placementCursor`, shared with `CanvasGridFrame`.
- **InlineEmphasisCommitTextField — Closed (Brief 9, Task 2 review decision).**
  The contract is a one-line value because line breaks are flattened; the
  auto-growing area is display mechanism rather than contract.

## Modeling

- **InlineTextBlock — Closed (Brief 8, Task 2.1).** The `heading` variant is now
  text-only; `HullHeaderFrame` owns the fixed-height padded strip.
- **PaneCollapseTab — Closed (Brief 9, Task 3).** Its pane-edge plane is now
  routed through the `stacking` data prop.
- **ValidationPopup — Closed (Brief 9, Task 3).** Its validation plane is now
  routed through the `stacking` data prop.
- **ColorSelect — Closed (Brief 9, Task 3).** Its selector plane is now routed
  through the `stacking` data prop.
- **StrokeSelect — Closed (Brief 9, Task 3).** Its selector plane is now routed
  through the `stacking` data prop.
- **Dropdown — Closed (Brief 9, Task 3).** Its menu plane is now routed through
  the `stacking` data prop.
- **CommitComboBox — Closed (Brief 9, Task 3).** The same-class audit found its
  unrecorded menu and validation planes; both are now routed as data props.
- **EdgeTextSurface — Closed (Brief 9, Task 4.3).** Pill width now follows the
  rendered text's intrinsic length while retaining the fixed minimums.
- **InlineActionButton — Closed (Brief 8, Task 3.3).** The transparent state is a
  deliberate keyboard path for `EditableTextList`; keyboard focus now reveals
  the control.
- **GridFrame — Closed (Brief 8, Task 2.2).** The unrelated variants were split
  into `WorkspaceFrame`, `CanvasGridFrame`, and `CanvasViewportFrame`, with the
  workspace arranger in the chrome wing.

## Contract asymmetry

- **CommitComboBox — Closed (Brief 8, Task 3.1).** Changing `disabled` to true now
  closes an already-open menu.
- **CommitTextField / CommitClearableTextField / CommitComboBox /
  InlineCommitTextField / InlineEmphasisCommitTextField / EditableEdgeText** —
  **Closed (Brief 8, Task 4).** The audit confirmed `onDiscard(messages)` means
  invalid abandonment and `onCancel()` means backing out throughout; the
  message-free `EditableEdgeText` outcome is now `onCancel`.
- **Dropdown / ColorSelect / StrokeSelect — Closed (Brief 9, Task 4.2).** Dropdown
  now closes on an outside press without selection and returns focus to its
  control, matching the selector shape.
- **ValidationPopup / InlineValidationPopup — Closed (Brief 9, Task 4.1).** Inside
  presses no longer dismiss; outside presses, keyboard dismissal, and the dismiss
  control still do.
- **TextField / InlineTextField — Closed (Brief 9, Task 2 review decision).**
  After dead-option removal, each wing owns the contract appropriate to its own
  surface; cross-wing visual coincidence is never dependence.
- **InlineCommitTextField — Closed (Brief 8, Task 2.3).** Display text and edit
  request are now flat `displayText` and `onEditRequest` props; `treatment` has one
  top-level home.
- **HullSurfaceFrame / StickyNoteSurfaceFrame / StyledBoxSurfaceFrame — Closed
  (Brief 8, Task 4).** Canvas surface frames now report clicks through `onClick`,
  matching the library-wide handler grammar.

## Open-typed configuration

- **BoxOutline — Closed (Brief 9, Task 5).** `centerOffset` is numeric pixel
  geometry and the element applies the unit.
- **ResizeAffordance — Closed (Brief 9, Task 5).** `centerOffset` is numeric pixel
  geometry and the element applies the unit; `BoxInteractionOverlay` routes the
  same shape.
- **StrokeSelect — Closed (Brief 9, Task 5 verification).** `popupWidth` was
  already numeric and remains a woven data prop because its value is consumer
  layout knowledge rather than an element-defined option.

## Law friction

- **InlineEmphasisCommitTextField — Closed (Brief 9, Task 1.1).** The content
  refinement classifies `initialEmphasis` as editable-state content regardless of
  its closed type; its annotation now weaves it as a data prop.
- **BoxHeaderFrame — Closed (Brief 9, Task 1.1).** The content refinement keeps
  the complete user-style separator tuple together as woven data.
- **CompartmentStack — Closed (Brief 9, Task 1.1).** The content refinement keeps
  the complete user-style separator tuple together as woven data.
- **GridFrame — Closed (Brief 8, Task 2.2).** Splitting the three frames removed
  the discriminated union; `placementActive` belongs only to `CanvasGridFrame`.
- **FieldGrid — Closed (Brief 9, Task 1.1).** Classification now applies only to
  the component's own props; nested `alignment` is documented where `rows`
  weaves and in the row boundary annotation.
- **Dropdown — Closed (Brief 9, Tasks 1.2 and 6).** `DropdownOption` now has an
  annotation home under its owning component and renders in the catalog.

## Dead-option candidates

- **Button — Closed (Brief 11, Tasks 4–5).** The utilization check convicted its
  four-axis surface; the replacement `variant` retains only the three exercised
  command situations, deleting the unused accent and pill treatments.
- **TextField — Closed (Brief 11, Task 4).** The dead `autoFocus` modifier and its
  treatment were deleted. Unused `disabled` remains a coherent lifecycle state,
  which the Modifier design law explicitly permits beyond current consumption.
- **ToggleButton — Closed (Brief 11, Task 4).** The dead `micro` and `compact`
  sizes and their treatments were deleted. Unused `disabled` remains a coherent
  lifecycle state.
- **ColorSelect / StrokeSelect / Dropdown — Closed (Brief 11, Task 4 review).**
  Their unused `disabled` entries are lifecycle states and remain as coherent
  selector state-machine surface.
- **CommitClearableTextField / CommitComboBox — Closed (Brief 11, Task 4
  review).** Their unused `disabled` entries are lifecycle states and remain as
  coherent commit-control state-machine surface.
- **CommitTextField auto focus — Closed (Brief 11, Task 4).** The dead
  `autoFocus` modifier and pass-through were deleted; unused `disabled` remains
  a coherent lifecycle state.
- **CommitTextField cancel affordance — Open (Brief 11, Task 4 regression
  review).** History at `dbdbfbab` proves `isCancelVisible` was introduced for a
  live relationship-edge editor. The canvas migration moved that situation to
  `InlineCommitTextField` without removing or re-homing the chrome contract.
  Per the brief's special case, retain it and review whether chrome cancellation
  still has a planned consumer or should be removed in a follow-up.
- **SwatchToggle — Closed (Brief 11, Task 4 review).** Its unused `disabled`
  entry is a lifecycle state and remains as coherent toggle state-machine
  surface.
- **EditableTextList / InlineEmphasisCommitTextField / InlineToggleButton —
  Closed (Brief 11, Task 4).** Their dead `default` and `neutral` surface choices
  were removed; the sole exercised base treatment is now element-owned rather
  than exposed as a one-value modifier.
