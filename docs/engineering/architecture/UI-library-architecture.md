# Ontology

### Vocabulary

**Library** — a centralized repository of encapsulated UI elements, used by View components to reduce entropy in visual/behavioral representation by hard limitation of pattern variety

**Library component**  — a component implemented in UI library

**Domain component** — a component implemented in a React tree rooted at EditorRoot

**Primitives** — lowest-level reusable UI parts with fixed visuals and behavior, e.g. button with icon. Leaves of the library: they import nothing from it. Used inside composites, templates, or Shiny components. **Owns a design decision**: it fixes which tokens/visual choices apply, removing that choice from consumers. An element whose appearance is entirely determined by passed-in runtime values owns no decision and is not a library component.

**Composites** — reusable UI elements assembled from primitives, other composites and native DOM elements (nat), owning both their visuals and their interaction behavior — e.g. an editable field with fixed styling, commit/discard logic, and a validation error pop-up.

**Templates** — structural UI containers that arrange, group, or frame other library elements without owning behavior, e.g. a EditPane section with a label and several composites.

**Tier** — the library composition level of an element — primitive, composite, or template.

**Brand styles** — visual identity decisions shared across components: palette, typography, corner radius, elevation, control density. Expressed exclusively as `--shiny-*` tokens defined once; a rebrand changes them everywhere at once.

**Structural styles** — per-component layout mechanics: internal offsets, arrangement, hit-area sizes. Meaningless outside their component, untouched by a rebrand

_Terminology lineage: Atomic-Design-inspired (primitives ≈ atoms, composites ≈ molecules/organisms, templates ≈ templates), with desktop-controls flavor for the middle tier._

### Rules

**Tier law (editor-blindness)**

- Library elements never import the state ledger, `editorCommands`, contexts, `editorUiConfig`, or anything under `EditorRoot/` — their entire interface is UI props in, `on<Event>` handlers out
- Internal drafts (in-progress text, drag positions) are local view state owned by the element; semantic meaning, dispatch, and transactions stay in the domain components that compose it
- Composition inside the library flows downward only: composites use primitives and native elements; templates arrange library elements and own no behavior; primitives import nothing from the library and may wrap governed native elements
- Domain-flavored assemblies of library elements (e.g. a grid of relationship tool presets) are _applications_ of the library and reside in View React tree 

**Naming**

- Library elements are named after their UI/behavior and are completely semantic-agnostic: `ResizeAffordance`, not `ClassResizeAffordance`
- Standard UX pattern names are used bare when the element behaves exactly as the pattern implies, committing natively with nothing added: `Dropdown`
- A modifier prefix marks a standard element augmented with specific behavior beyond the pattern's own definition; the modifier names the augmentation, e.g. `Commit` for the repo-specific commit lifecycle (local draft, validated commit, rejection feedback): `CommitComboBox` — a standard combo box whose custom-value entry is wrapped in the lifecycle
- An element that cannot be named without a domain word does not belong in the library

**Variety**

- Library variety is biased towards fewer elements; a new element is admitted only when its UI/behavior cannot be expressed by composing or configuring existing ones (mirror of the command-primitive rule)
- All chrome elements (ToolPane, EditPane) are built exclusively from library elements, even non-repetitive ones; they contain **no native DOM at all**
- Diagram elements are encapsulated only when they can be expressed in pure UI/behavior terms, e.g. `EditableList` is encapsulated, `ClassBox` is not

**Governance**

- Raw native interactive elements (`input`, `button`, `select`, `textarea`) are forbidden outside the library — lint-enforced; the tier law is boundary-checker-enforced
- Chrome components contain no native DOM — library elements exclusively; any intrinsic tag in chrome paths is a lint violation
- A missing element is proposed as a library addition, never inlined at the use site
- This document is a pure index/tracker of the library and its mapping onto components; the rules above migrate to `design-system.md` and `react-standards.md` in step 2 of the hardening plan and are recorded here only until then

**Glyph construction**

- Glyphs use a `16 × 16` viewBox. Coordinates are whole or half pixels, shapes snap to a 1px grid, and geometry keeps at least 2px padding from every viewBox edge.
- A glyph set uses one stroke language: `stroke-width="1.5"`, `stroke-linecap="round"`, and `stroke-linejoin="round"`. `fill="none"` is the default; fill is used only when semantically required, such as a composition diamond.
- Color is `currentColor` exclusively, and every decorative glyph is `aria-hidden="true"`.
- VS Code Codicons and Lucide are the metrics reference for weight, density, and optical balance.
- Geometry is specified with exact coordinates. Code and briefs never describe it as “roughly centered.”

---
# Library components

Composes lists library elements — (prim), (comp) — and governed native interactive elements — (nat); non-interactive native DOM is not listed

### Composites

Behavior lists only augmentation beyond the bare pattern; "—" means pattern-defined behavior with nothing added.

| Element                  | Composes                                                      | Behavior                                                                                                                                                                                                                                                                | Props                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| CommitTextField          | TextField (prim)<br>DismissButton (prim)<br>ValidationPopup (prim) | validation runs on commit attempt only<br>Enter: valid → commit; invalid → anchored popup, stays editing<br>first draft change dismisses popup<br>Blur: valid → commit; invalid → discard, draft dropped, feedback escalates to consumer<br>Esc or optional cancel button → cancel and dismiss popup; no validation, no feedback<br>empty draft commits as a value | `initialValue`<br>`validate(draft)→messages`<br>`disabled`<br>`ariaLabel`<br>`isLabelVisible`<br>`autoFocus`<br>`appearance` (pane \| inline)<br>`isCancelVisible`<br>`onDraftChange(value)` (optional)<br>`onCommit(value)`<br>`onDiscard(messages)`<br>`onCancel` |
| CommitTextArea           | Button (prim)<br>textarea (nat)                               | no validation<br>Save button commits; inline appearance renders it as a compact accent pill over the bottom-right corner<br>Enter inserts newline<br>Blur commits<br>Esc → cancel                                                                                           | `initialValue`<br>`disabled`<br>`autoFocus`<br>`appearance` (pane \| inline)<br>`onCommit(value)`<br>`onCancel` |
| CommitClearableTextField | TextField (prim)<br>DismissButton (prim)<br>ValidationPopup (prim) | CommitTextField lifecycle<br>30%-smaller Clear control visible only while the populated field has focus<br>Clear commits empty value without entering editing | `initialValue`<br>`validate(draft)→messages`<br>`disabled`<br>`ariaLabel`<br>`isLabelVisible`<br>`onCommit(value)`<br>`onClear`<br>`onDiscard(messages)`<br>`onCancel` |
| EmphasisCommitTextField  | TextArea (prim)<br>ToggleButton (prim)<br>ValidationPopup (prim) | visually wrapping editor auto-sized to rendered lines while its value remains single-line; newline input and pasted line breaks are blocked<br>two micro ToggleButtons (underline, italic) overlay above without layout participation and are mutually exclusive<br>emphasis is part of the local draft: toggles never emit per press<br>Enter commits text and emphasis atomically; Esc discards both<br>inherits the CommitTextField validation lifecycle otherwise | `initialValue`<br>`initialEmphasis`<br>`validate(draft)→messages`<br>`disabled`<br>`autoFocus`<br>`appearance` (pane \| inline)<br>`onCommit(value, emphasis)`<br>`onDiscard(messages)`<br>`onCancel` |
| CommitComboBox           | TextField (prim)<br>ValidationPopup (prim)<br>button (nat)    | option select commits natively<br>typed custom value follows CommitTextField lifecycle                                                                                                                                                                                  | `initialValue`<br>`options`<br>`validate(draft)→messages`<br>`disabled`<br>`ariaLabel`<br>`isLabelVisible`<br>`onCommit(value)`<br>`onDiscard(messages)`<br>`onCancel` |
| Dropdown                 | button (nat)                                                  | —                                                                                                                                                                                                                                                                       | `options` (value, label, optional swatch style, kind, and label visibility)<br>`value`<br>`disabled`<br>`onChange(value)` |
| ColorSelect              | button (nat) trigger and swatches                             | immediate swatch commit and close<br>document colors wrap without scrolling<br>Base clears the value at the editing layer and shows its inherited value<br>Esc/click-outside cancel and return focus to trigger<br>APG grid arrow navigation with Enter selection<br>multiple state has no selected ring<br>preset catalog supplied from `View/config/stylePresets.ts` | `glyph` (fill \| stroke \| text)<br>`value` (color \| null \| multiple)<br>`baseValue`<br>`presets` (24 hue shades in a 6 × 4 grid plus a separated 6-swatch grayscale row)<br>`documentColors`<br>`disabled`<br>`onChange(value)` |
| StrokeSelect             | svg line sample<br>button (nat) trigger and options           | one width/dash selector selected by `kind`<br>literal-only full-width sample rows<br>Base clears the value at the editing layer<br>document-authored values take precedence over normalized Standard duplicates<br>immediate commit and close<br>Esc/click-outside cancel and return focus<br>APG vertical-list arrow navigation with Enter selection<br>multiple state has no selected ring | `kind` (width \| dash)<br>`value` (literal \| null \| multiple)<br>`defaultValue` (inherited Base value)<br>`presets`<br>`documentValues`<br>`popupWidth`<br>`disabled`<br>`onChange(value)` |
| SwatchToggle             | StyledBoxSwatch (prim)<br>button (nat)                        | reports activation and exposes pressed state                                                                                                                                                                                                                            | `styleValues`<br>`label`<br>`pressed`<br>`disabled`<br>`onClick` |
| EditableList             | EmphasisCommitTextField (comp)<br>button (nat) | row enters inline editing on click [edit start enabled]<br>emphasis toolbar gated by `isEmphasisEditable`; off → rows behave as plain CommitTextField<br>trailing add cell always reserves compact height; full-width tinted plus pill appears on cell hover [edit start enabled] and opens an empty editor row<br>row drag reorder within the list with drop indicator | `rows` (text, optional `emphasis`: underline \| italic, mutually exclusive by type)<br>`addLabel`<br>`addTitle`<br>`validate(draft)→messages`<br>`isEditStartEnabled`<br>`isEmphasisEditable`<br>`onRowCommit(index, value, emphasis)`<br>`onRowAdd(value, emphasis)`<br>`onRowReorder(from, to)` |

### Templates

| Element      | UI                                          | Props                              |
| ------------ | ------------------------------------------- | ---------------------------------- |
| PaneFrame    | fixed-width or zero-width vertical stack in a side pane | `width`<br>`collapsed`<br>`edgeControl`<br>`children` |
| PaneSection  | optionally labeled 1–2 column content group | `label`<br>`columns`<br>`spacingAfter` (default \| compact)<br>`children` |
| FieldGrid    | optionally inset rows of label + control    | `rows` (label, control, optional alignment)<br>`inset`<br>`controlWidth` (full \| half \| wide [80%])<br>`labelWidth` (compact \| standard) |
| ControlGroup | 1–2 column grouping of controls             | `columns`<br>`spacing` (default \| wide)<br>`children` |

### Primitives

| Element          | Composes     | Props                                                     |
| ---------------- | ------------ | --------------------------------------------------------- |
| TextField        | input (nat)  | `value`<br>`disabled`<br>`invalid`<br>`ariaLabel`<br>`autoFocus`<br>`hasEndAction`<br>`appearance` (pane \| inline)<br>`onChange`<br>`onBlur`<br>`onKeyDown` |
| TextArea         | textarea (nat) | `value`<br>`rows`<br>`disabled`<br>`invalid`<br>`autoFocus`<br>`appearance` (pane \| inline)<br>`onChange`<br>`onBlur`<br>`onKeyDown` |
| ValidationPopup  | popover (nat)<br>button (nat) | red pill with centered single-line white text and a small tail; exact cross-only dismiss glyph in a square surface-backed hit target; anchored above and flipped below when top-clipped; no layout participation; dismiss button, Escape, or the next outside pointer press requests dismissal; browser top layer escapes local clipping and stacking contexts | `messages`<br>`onDismiss` |
| TextBlock        | —            | `text`                                                     |
| Button           | button (nat) | `label`<br>`icon`<br>`disabled`<br>`tone` (neutral \| danger \| accent)<br>`size` (default \| compact)<br>`shape` (rounded \| pill)<br>`alignment` (stretch \| end)<br>`visible` (hidden state reserves layout space)<br>`onClick` |
| DismissButton    | button (nat) | exact cross-only glyph; circular surface-backed target | `label`<br>`small`<br>`onClick`<br>`onMouseDown` |
| BackAffordance   | button (nat) | `label`<br>`visible` (hidden state reserves layout space)<br>`onClick` |
| PaneCollapseTab  | button (nat) | edge-mounted chevron flips between collapse and expand direction | `collapsed`<br>`onToggle` |
| ToggleButton     | button (nat) | `icon`<br>`label` (optional)<br>`title`<br>`pressed`<br>`disabled`<br>`size` (micro \| compact \| nodeTile \| relationshipTile)<br>`onClick` |
| StyledBoxSwatch  | —            | `styleValues`<br>`label`                                  |
| BoxOutline       | —            | `variant` (hover \| selected \| pending)                 |
| HaloRing         | —            | `tint`                                                    |
| ResizeAffordance | button (nat) | eight visible squares plus four invisible full-edge hit zones; `onGrab(handle, point)` — handle: nw \| n \| ne \| e \| se \| s \| sw \| w |
| Divider          | —            | —                                                         |

---
# Application

Mapping of library components to domain components. Behaviors described are behaviors of domain components. For behavior of library components used - see "Library components" section

### EditPane/ClassEditPane

Multiple boxes with different styles might be selected

The EditPane's PaneFrame receives a PaneCollapseTab as its edge control. Collapsed state is local to EditPane, persists across selection changes, and reduces the frame width to zero while leaving the tab visible at the screen edge.

**PaneFrame › PaneSection** ("Class properties", single selection only)

| Element                  | FieldGrid label | Value / behavior |
| ------------------------ | --------------- | ---------------- |
| CommitComboBox           | ""              | current annotation or "No annotaion" — preset/custom editable; positioned above Name |
| CommitTextField          | "Name"          | class name — editable |
| CommitClearableTextField | "Label"         | class label or empty — editable and clearable |
| Dropdown                 | "Style"         | named style, "No style", or "Custom style" — editable; options render the name inside a full-width swatch |
| Button                   | "Style"         | "Edit style" for an applied named style; "Save style" for a direct style; disabled when neither action applies |

The controls are arranged by an inset `FieldGrid`; the Style row uses start alignment so its label aligns with the Dropdown above the Button. The Dropdown and Button share a one-column `ControlGroup`. Edit/Save selects the named style with the class selection as its return origin.

**PaneFrame › PaneSection** ("Configure style")

| Element  | FieldGrid label | Same style property | Different style property |
| -------- | --------------- | ------------------- | ------------------------ |
| ColorSelect | "Fill"       | current/document/preset color — editable; Base clears | neutral multiple glyph; choosing a color applies to all |
| ColorSelect | "Stroke"     | current/document/preset color — editable; Base clears | neutral multiple glyph; choosing a color applies to all |
| StrokeSelect | "Width"     | current/base/document/standard literal — editable | indeterminate sample; choosing a literal applies to all |
| StrokeSelect | "Dash"      | current/base/document/standard literal — editable | indeterminate sample; choosing a literal applies to all |
| ColorSelect | "Text color" | current/document/preset color — editable; Base clears | neutral multiple glyph; choosing a color applies to all |

Color preset names are exposed as tooltips in the popup. Width and Dash use literal values only.

**PaneFrame › PaneSection** ("Actions")

| Element | Label       | Behavior |
| ------- | ----------- | -------- |
| Button  | "Duplicate" | enabled |
| Button  | "Delete"    | danger tone; Delete key binding |

Buttons are arranged in a two-column `ControlGroup`.

### EditPane/RelationshipEditPane

Single relationship selection only

**PaneFrame › PaneSection** ("Relationship label")

| Element                  | Label | Selected relationship                        |
| ------------------------ | ----- | -------------------------------------------- |
| CommitClearableTextField | —     | full-width _current label_ or empty          |

The clear action is a thin error-colored cross inside a circular outline.

**PaneFrame › PaneSection** ("Relationship shape")

| Element  | Label             |                                  |
| -------- | ----------------- | -------------------------------- |
| Dropdown | "Source endpoint" | full-width selector; icon-only samples with doubled line length and enlarged endpoint marker |
| Dropdown | "Line"            | full-width selector; icon-only doubled-length line samples |
| Dropdown | "Target endpoint" | full-width selector; icon-only samples with doubled line length and enlarged endpoint marker |
| Button   | "Reverse"         |                                  |

**PaneFrame › PaneSection** ("Multiplicity")

| Element        | Label    | Selected relationship           |
| -------------- | -------- | ------------------------------- |
| CommitComboBox | "Source" | full-width _current value_ or empty; options contain literals only |
| CommitComboBox | "Target" | full-width _current value_ or empty; options contain literals only |

**PaneFrame › PaneSection** ("Actions")

| Element | Label       |         |
| ------- | ----------- | ------- |
| Button  | "Duplicate" | enabled |
| Button  | "Delete"    | enabled |

Buttons are arranged in a two-column `ControlGroup`.
### EditPane/DiagramEditPane

No selection represents the diagram; selecting Base style or a named style expands the same pane into style editing. Base style is always present and is not an applicable/renameable/deletable named style. Semantics are defined by [Style resolution](../style-resolution.md).

`DiagramView.styles` is source-ordered occurrence truth for declared, direct-class, and namespace style occurrences. `DiagramView.baseStyle` is resolved base-customization truth. Named-style management filters explicitly to `kind === "declared" && name !== "default"`; document-value derivation consumes all occurrence kinds.

**PaneFrame top affordance** (style selected with class origin only)

| Element | Label | Behavior |
| ------- | ----- | -------- |
| BackAffordance | "← Back" | restores the originating class selection; hidden state reserves the row so pane content does not shift |

**PaneFrame › PaneSection** ("Saved styles", always mounted)

| Element | No style selected | Base/named style selected |
| ------- | ----------------- | ------------------------- |
| SwatchToggle | pinned "Base style" chip resolved from customization over pure defaults | pressed for Base selection |
| SwatchToggle | one per declared non-default named style, none pressed | selected named style pressed; click selects without an origin |
| Button | "+ New style" creates a uniquely named initialized style and selects it | same |

Style chips are full-width rows; Base is visually separated and pinned first.

**PaneFrame › PaneSection** ("Edit base style", Base selection only)

| Element | Label | Behavior |
| ------- | ----- | -------- |
| TextBlock | — | quiet explanation that Base applies wherever a class style leaves a property unset |
| ColorSelect / StrokeSelect | property labels | edits only base customizations; Base rows show pure defaults |
| Button | "Reset base" | removes `classDef default`; disabled when `baseStyle` is empty |

**PaneFrame › PaneSection** ("Edit style", named-style selection only)

| Element | Label | Selected style |
| ------- | ----- | -------------- |
| CommitTextField | "Name" | style name — editable |

| Element | FieldGrid label | Selected style |
| ------- | --------------- | -------------- |
| ColorSelect | "Fill" | current/document/preset color — editable; Base clears |
| ColorSelect | "Stroke" | current/document/preset color — editable; Base clears |
| StrokeSelect | "Width" | current/base/document/standard literal — editable |
| StrokeSelect | "Dash" | current/base/document/standard literal — editable |
| ColorSelect | "Text color" | current/document/preset color — editable; Base clears |

Color preset names are exposed as tooltips in the popup. Width and Dash use literal values only.

**PaneFrame › PaneSection** ("Actions", named-style selection only)

| Element | Label | Behavior |
| ------- | ----- | -------- |
| Button | "Set as base" | copies the selected style properties into independent base customizations |
| Button | "Delete style" | danger tone; deletes the definition and its applications |

Buttons are arranged as full-width rows in a one-column `ControlGroup`.

### EditPane/NamespaceEditPane

Single namespace selection only.

**PaneFrame › PaneSection** ("Namespace name")

| Element         | Label | Selected namespace        |
| --------------- | ----- | ------------------------- |
| CommitTextField | —     | full-width namespace name — editable |

The field spans the pane content width.

**PaneFrame › PaneSection** ("Configure style")

| Element     | Label              | @style annotation present            | No @style annotation                 |
| ----------- | ------------------ | ------------------------------------ | ------------------------------------ |
| ColorSelect | "Fill"             | current/base/document/preset color — editable | quiet token-resolved glyph; Base selected |
| ColorSelect | "Stroke"           | current/base/document/preset color — editable | quiet token-resolved glyph; Base selected |
| ColorSelect | "Text color"       | current/base/document/preset color — editable | quiet token-resolved glyph; Base selected |
| StrokeSelect | "Width"            | current/base/document/standard literal — editable | base or pure-default sample; Base selected |
| StrokeSelect | "Dash"             | current/base/document/standard literal — editable | base or pure-default sample; Base selected |

The controls are arranged by an inset half-width `FieldGrid`.

**PaneFrame › PaneSection** ("Actions")

| Element | Label         | Behavior                                    |
| ------- | ------------- | ------------------------------------------- |
| Button  | "Reset style" | disabled when no direct namespace style exists |
| Button  | "Delete"      | danger tone                                 |

Buttons are arranged in a two-column `ControlGroup`.

### EditPane/NoteEditPane

Single note selection only.

**PaneFrame › PaneSection** ("Attachment")

| Element         | Free note                                    | Attached note                                                        |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------- |
| StyledBoxSwatch | not mounted                                  | full-width pill resolved in the attached class style, labeled by its class name; non-interactive |
| Button          | full-width "Attach to class" button in the swatch row; hidden compact button reserves the action row | compact end-aligned "Detach" button                                 |

Both states reserve the same two rows, so the following Actions section does not shift when attachment changes.
The Attachment section uses compact trailing spacing before Actions.

**PaneFrame › PaneSection** ("Actions")

| Element | Label       | Behavior    |
| ------- | ----------- | ----------- |
| Button  | "Duplicate" | enabled     |
| Button  | "Delete"    | danger tone |

Buttons are arranged in a two-column `ControlGroup`.

### DiagramCanvas/.../ClassBox

**Box shell and overlays**

| Element          | Application behavior                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| BoxOutline       | mounted [hovered and not selected] with variant `hover`; mounted [selected] with variant `selected`; mounted [pending member during namespace gesture] with variant `pending` |
| HaloRing         | mounted [captured by a foreign hull]; passed tint = _native namespace fill_, canvas color if parentless              |
| ResizeAffordance | mounted [selected]                                                                                                   |

**Header compartment** (domain layout; non-editing blocks render as domain text)

| Element                  | Block      | Application behavior                                                                                               |
| ------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| CommitTextField | annotation | mounted [block editing]; passed initial value = _current annotation_; block area absent when empty and not editing |
| CommitTextField | name       | mounted [block editing]; passed initial value = _display name incl. generics_                                      |
| CommitTextField | label      | mounted [block editing]; passed initial value = _current label_; block area absent when empty and not editing      |

At most one block is in editing at a time; the box remains selected while editing.

**Attribute / method compartments** (domain layout)

| Element      | Instance               | Application behavior                                                                                                        |
| ------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| EditableList | attributes             | always mounted; edit start enabled [box selected]; passed add label = "[+ attribute]"; rows = _attribute texts + emphasis_ |
| EditableList | methods                | always mounted; edit start enabled [box selected]; passed add label = "[+ method]"; rows = _method texts + emphasis_       |
| Divider      | compartment boundaries | always mounted — conditional library admission, pending consumer count at refactor                                          |

Classifiers map to emphasis in the domain (static → underline, abstract → italic), both directions; the emphasis toolbar during row editing is EmphasisCommitTextField behavior, enabled via `isEmphasisEditable`.

### DiagramCanvas/.../NoteBox

(domain layout; note surface and non-editing text render as domain surface)

|Element|Application behavior|
|---|---|
|BoxOutline|mounted [hovered and not selected] with variant `hover`; mounted [selected] with variant `selected`|
|ResizeAffordance|mounted [selected]|
|CommitTextArea|mounted [text editing] with inline appearance; passed initial value = _note text_|

### DiagramCanvas/.../NamespaceBox

(domain layout; the name overlays the hull body's upper-left corner — bounds and colors are runtime values; there is no separate header band, and hull margin is equal on all four sides)

| Element          | Application behavior                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| BoxOutline       | mounted [hovered and not selected] with variant `hover`; mounted [selected] with variant `selected`; mounted [pending member during namespace gesture] with variant `pending` |
| ResizeAffordance | mounted [selected]                                                                                                   |
| CommitTextField  | mounted [name editing] with inline appearance; passed initial value = _namespace name_                               |

Resize is a membership gesture, not a bounds edit: the dragged rect selects pending members by overlap; on release bounds re-derive from the new member hull, and the rect itself is never persisted (no-empty-namespace rule applies).

### DiagramCanvas/.../RelationshipEdge

(domain rendering; edge path, endpoint markers, and hit area render as domain SVG — geometry and marker kinds are runtime values)

|Element|Block|Application behavior|
|---|---|---|
|CommitTextField|label|mounted [label set or block editing]; passed initial value = _current label_; edit start enabled [selected]|
|CommitTextField|source multiplicity|mounted [multiplicity set or block editing]; passed initial value = _current multiplicity_; edit start enabled [selected]|
|CommitTextField|target multiplicity|mounted [multiplicity set or block editing]; passed initial value = _current multiplicity_; edit start enabled [selected]|

Non-editing text renders as domain SVG; editing mounts CommitTextField in an HTML overlay positioned at the block. `EditableText` is deleted at the edge migration — no SVG-hosted field variant exists.

Only the selected relationship is reconnectable. Selection coloring includes its endpoint glyphs. Its source and target render small, lightly bordered `--shiny-selection` circles inset along the edge so thick box borders cannot cover the grab-reconnect indicators; deselected relationships expose neither indicators nor reconnect mechanics.

### ToolPane

**PaneFrame › PaneSection** ("Diagram nodes")

ToggleButtons with icon + label, arranged in a column

| Element      | Label                 | Application behavior                 |
| ------------ | --------------------- | ------------------------------------ |
| ToggleButton | "Class"               | pressed [class placement active]     |
| ToggleButton | "Namespace"           | pressed [namespace placement active] |
| ToggleButton | "Note"                | pressed [note placement active]      |

**PaneFrame › PaneSection** ("Relationships")

ToggleButtons icon-only, arranged in two columns

| Element      | Label                                                                                                                                        | Application behavior                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| ToggleButton | "Association", "Directed association", "Bidirectional association", "Dependency", "Inheritance", "Realization", "Aggregation", "Composition" | pressed [relationship placement active with matching seed] |

---
# Organization

### Structure of View/ui/

```
View/ui/
├── tokens.css            brand tokens: --shiny-* definitions, imported once by styles.css
├── primitives/
│   └── TextField/
│       ├── TextField.tsx
│       └── TextField.module.css
├── composites/
│   └── Dropdown/
│       ├── Dropdown.tsx
│       ├── Dropdown.module.css
│       └── OptionList/       owned child
└── templates/
    └── PaneSection/
```

- A component's tier is its folder path; the boundary checker enforces tier import rules by path
- Component folder closed set: `<Component>.tsx`, `<Component>.module.css`, owned children — exclusively-owned nested components, imported only by the parent, never exported; they inherit the parent's tier
- Brand styles are `--shiny-*` tokens reached via cascade, never imported; structural styles are literals in the component's `.module.css`
- Icon glyphs are domain-owned (domain-named → not library); the library owns only the `icon` slot and its color
- A glyph is inline SVG in the owning domain component's static catalog area or `icons.tsx` support file; `currentColor` exclusively — any color inside a glyph is a lint violation

### Import/export rules

**Inside View/ui/**

|Tier|May import from the library|
|---|---|
|Primitives|nothing|
|Templates|nothing — children arrive as props|
|Composites|primitives and other composites, acyclic|

- All tiers additionally: React and browser APIs, own children, own `.module.css`
- Nothing domain-side (tier law), no framework libraries
- No root or tier barrels; direct imports from defining component files

**Between library and domain components**

- A component folder exports the component and its boundary types (option shapes, swatch style shape) — deliberate divergence from the domain children-rule
- Domain components deep-import library components; owned children, internals, and `.module.css` are off-limits
- Consumers: EditorRoot tree and library composites only — never Shell, Controller, Bridge, mermaidRenderer
