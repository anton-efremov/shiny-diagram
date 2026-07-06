## Target components

|Component|renders|receives view|receives state|receives callbacks|receives UI props|owns state|emits (commands)|
|---|---|---|---|---|---|---|---|
|ToolPane / RelationshipTools / RelationshipTools.tsx _(exists — extend)_|8 relationship-type buttons per spec table; the button whose combo is armed renders pressed|—|placement: relationship arm|onRelationshipPlacementStart(combo)|—|—|—|
|DiagramCanvas / ReactFlowCanvasAdapter / RelationshipEdgeAdapter / RelationshipEdgeAdapter.tsx _(new)_|React Flow custom edge wrapper: framework edge props → RelationshipEdge props|—|—|— (unpacked from edge `data`)|edge descriptor `data`|—|—|
|… / RelationshipEdgeAdapter / RelationshipEdge / RelationshipEdge.tsx _(new)_|edge path, end markers, label text area, 2 multiplicity text areas, selected look, inline edit inputs|relationship: single (RelationshipView)|—|onRelationshipSelect(relationshipId)|isSelected|inline-edit local state (which text area, draft; Enter commits, Esc discards)|relationship.label.set (inline edit)<br>relationship.source.multiplicity.set / relationship.target.multiplicity.set (inline edit)|
|StylePane / StylePane.tsx _(exists — extend)_|routes selection kind `relationship` to RelationshipStylePane (today it routes to Empty)|+ relationships: full (slices the selected one by relationshipId)|selection: full|+ onRelationshipDuplicate — pass-through|—|—|—|
|StylePane / RelationshipStylePane / RelationshipStylePane.tsx _(new)_|composition of EdgeShapeControls, MultiplicityControls, LabelControls, EdgeActions|relationship: selected (RelationshipView) — pass-through slice|—|onRelationshipDuplicate — pass-through|—|—|—|
|StylePane / RelationshipStylePane / EdgeShapeControls / EdgeShapeControls.tsx|3 dropdowns (source marker: 6 values; line: 2 values; target marker: 6 values) + [Reverse] button|relationship: selected (RelationshipView)|—|—|—|dropdown open (local)|relationship.source.endpointKind.set<br>relationship.target.endpointKind.set<br>relationship.lineKind.set<br>Reverse: see command note below|
|StylePane / RelationshipStylePane / MultiplicityControls / MultiplicityControls.tsx|2 comboboxes: none, `1`, `0..1`, `*`, `0..*`, `1..*`, custom|relationship: selected (RelationshipView)|—|—|—|custom-value drafts (Enter commits)|relationship.source.multiplicity.set<br>relationship.target.multiplicity.set ("none" → null)|
|StylePane / RelationshipStylePane / LabelControls / LabelControls.tsx|label text input + [Remove Label] button|relationship: selected (RelationshipView)|—|—|—|label draft (Enter commits, Esc discards)|relationship.label.set ([Remove Label] → null)|
|StylePane / RelationshipStylePane / EdgeActions / EdgeActions.tsx|[Duplicate] and [Delete] buttons|relationship: selected (RelationshipView) — source of the duplicate seed|—|onRelationshipDuplicate(seed)|—|—|relationship.delete|

### Notes

**Relationship type is a ToolPane-only concept.** Each button owns a fixed mapping from its label to a marker/line/marker combo (Inheritance → `{triangle, solid, none}`, Bidirectional association → `{arrow, solid, arrow}`, and so on). The button resolves the combo and passes the combo up; nothing outside `RelationshipTools.tsx` ever sees a type name. Acceptance check: `RelationshipType` is imported by exactly one file. The pressed-button look works the same way — the button compares the armed combo in placement state against its own combo; no type name is stored.

**Placement mode (two-click create).** `NodePlacementState` grows a relationship arm:

- payload: the seed (source marker, line, target marker, source/target multiplicity, label) + `pendingSourceClassId: ClassId | null`
- entered from a ToolPane button (seed = preset combo, empty multiplicities, no label) or from [Duplicate] (seed = copy of the selected relationship's attributes)
- first class-box click → store as pending source; second class-box click → dispatch `relationship.create` from seed + the two picked classes, exit placement
- click anywhere that is not a class box → cancel, exit placement
- selection is none after placement completes or cancels (per spec)
- class-box clicks are arbitrated at the owner through the existing `onClassSelect` seam: placement active → the click is a pick; placement inactive → the click is a selection
- open design point for the brief: who owns this state (DiagramCanvas owns `NodePlacementState` today, EditorSurface owns selection — the two interact here), and whether the first pick gets visual feedback (highlight picked box / ghost edge). Spec is silent on feedback.

**Selection wiring.** The `relationship` selection variant already exists in the union; nothing constructs it yet. This feature: adds `onRelationshipSelect` to the owner's interactions; turns the reconciliation `relationship` arm into a real existence check against `view.relationships` (today it silently keeps the selection); replaces StylePane's `relationship → Empty` placeholder with RelationshipStylePane. Single-relationship selection is structural in the union — no work needed.

**Emission stays at section level** (established pattern): each section receives the selected `RelationshipView` slice and dispatches through `useDispatchTransaction`; pane components are composition/routing only. [Duplicate] is the one action that is not a command — it seeds placement state, so it travels up as a callback instead of being dispatched.

## Required commands

#### Fully implemented commands already (declaration in View, implementation in Controller)

- — none. All ten `relationship.*` commands are declared, zero have translate workers — the entire relationship write path is new Controller work.

#### Declared commands already (not implemented in Controller yet)

- **relationship.create** — used by placement (both entry paths). Declared payload (two `RelationshipEndpoint`s + `lineKind` + `label: string | null`) already fits, including the duplicate seed. Needs an insertion anchor cascade (after last relationship; else after class declarations).
- **relationship.delete** — [Delete]. Whole-statement delete.
- **relationship.source.endpointKind.set** / **relationship.target.endpointKind.set** — marker dropdowns; also Reverse. Value replacement on the operator span; the serializer picks the canonical glyph for each side.
- **relationship.lineKind.set** — line dropdown; also Reverse. Value replacement on the operator span.
- **relationship.source.multiplicity.set** / **relationship.target.multiplicity.set** — comboboxes, inline edit; also Reverse. `null` clears. Wrinkle: the multiplicity span may not exist in the source line yet, so "set" is sometimes an insert into the statement, not a replace — needs design attention in the brief.
- **relationship.source.class.set** / **relationship.target.class.set** — Reverse only. Value replacement on the endpoint name spans.
- **relationship.label.set** — label input, [Remove Label], inline edit. `null` removes the `: label` suffix. Same may-not-exist wrinkle as multiplicity.

#### Not declared commands

- — none. Reverse is not a command: it is one transaction composed of the declared setters (both `class.set`, both `endpointKind.set`, both `multiplicity.set`, skipping pairs whose values are equal). All spans are disjoint parts of one statement, so the transaction is valid against one frozen snapshot. If the composed transaction proves awkward in practice, add a `relationship.reverse` convenience command then — not now.