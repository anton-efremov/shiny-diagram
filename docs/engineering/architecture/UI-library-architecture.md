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

---
# Library components

Composes lists library elements — (prim), (comp) — and governed native interactive elements — (nat); non-interactive native DOM is not listed

### Composites

Behavior lists only augmentation beyond the bare pattern; "—" means pattern-defined behavior with nothing added.

| Element                  | Composes                                                      | Behavior                                                                                                                                                                                                                                                                | Props                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| CommitTextField          | TextField (prim)<br>ValidationPopup (prim)                    | validation runs on commit attempt only<br>Enter: valid → commit; invalid → popup, stays editing<br>Blur: valid → commit; invalid → discard, draft dropped, feedback escalates to consumer<br>Esc → cancel; no validation, no feedback<br>empty draft commits as a value | `initialValue`<br>`validate(draft)→messages`<br>`disabled`<br>`ariaLabel`<br>`isLabelVisible`<br>`autoFocus`<br>`onCommit(value)`<br>`onDiscard(messages)`<br>`onCancel` |
| CommitTextArea           | Button (prim)<br>textarea (nat)                               | no validation<br>Save button commits<br>Enter inserts newline<br>Blur commits<br>Esc → cancel                                                                                                                                                                           | `initialValue`<br>`disabled`<br>`autoFocus`<br>`onCommit(value)`<br>`onCancel` |
| CommitClearableTextField | TextField (prim)<br>ValidationPopup (prim)<br>button (nat)    | CommitTextField lifecycle<br>Clear visible when value set<br>Clear commits empty value without entering editing                                                                                                                                                         | `initialValue`<br>`validate(draft)→messages`<br>`disabled`<br>`ariaLabel`<br>`isLabelVisible`<br>`onCommit(value)`<br>`onClear`<br>`onDiscard(messages)`<br>`onCancel` |
| EmphasisCommitTextField  | TextField (prim)<br>ToggleButton (prim)<br>ValidationPopup (prim) | two ToggleButtons (underline, italic) anchored above the field while mounted; mutually exclusive — pressing one clears the other<br>emphasis is part of the local draft: toggles never emit per press<br>commit emits text and emphasis atomically; Esc discards both<br>inherits the CommitTextField lifecycle otherwise | `initialValue`<br>`initialEmphasis`<br>`validate(draft)→messages`<br>`disabled`<br>`autoFocus`<br>`onCommit(value, emphasis)`<br>`onDiscard(messages)`<br>`onCancel` |
| CommitComboBox           | TextField (prim)<br>ValidationPopup (prim)<br>button (nat)    | option select commits natively<br>typed custom value follows CommitTextField lifecycle                                                                                                                                                                                  | `initialValue`<br>`options`<br>`validate(draft)→messages`<br>`disabled`<br>`ariaLabel`<br>`isLabelVisible`<br>`onCommit(value)`<br>`onDiscard(messages)`<br>`onCancel` |
| Dropdown                 | button (nat)                                                  | —                                                                                                                                                                                                                                                                       | `options` (value, label, optional swatch style, kind, and label visibility)<br>`value`<br>`disabled`<br>`onChange(value)` |
| ColorSelect              | button (nat) trigger and swatches                             | immediate swatch commit and close<br>document colors wrap without scrolling<br>Default clears the value<br>Esc/click-outside cancel and return focus to trigger<br>APG grid arrow navigation with Enter selection<br>multiple state has no selected ring<br>preset catalog supplied from `View/config/stylePresets.ts` | `glyph` (fill \| stroke \| text)<br>`value` (color \| null \| multiple)<br>`presets` (24 hue shades in a 6 × 4 grid plus a separated 6-swatch grayscale row)<br>`documentColors`<br>`disabled`<br>`onChange(value)` |
| StrokeSelect             | svg line sample<br>button (nat) trigger and options           | one width/dash selector selected by `kind`<br>literal-only full-width sample rows<br>Default clears the value<br>document-authored values take precedence over normalized Standard duplicates<br>immediate commit and close<br>Esc/click-outside cancel and return focus<br>APG vertical-list arrow navigation with Enter selection<br>multiple state has no selected ring | `kind` (width \| dash)<br>`value` (literal \| null \| multiple)<br>`defaultValue`<br>`presets`<br>`documentValues`<br>`popupWidth`<br>`disabled`<br>`onChange(value)` |
| SwatchToggle             | StyledBoxSwatch (prim)<br>button (nat)                        | reports activation and exposes pressed state                                                                                                                                                                                                                            | `styleValues`<br>`label`<br>`pressed`<br>`disabled`<br>`onClick` |
| EditableList             | EmphasisCommitTextField (comp)<br>Button (prim)<br>button (nat) | row enters editing on click [edit start enabled]<br>emphasis toolbar gated by `isEmphasisEditable`; off → rows behave as plain CommitTextField<br>trailing add affordance opens an empty editor row, visible [edit start enabled]<br>row drag reorder within the list with drop indicator | `rows` (text, optional `emphasis`: underline \| italic, mutually exclusive by type)<br>`addLabel`<br>`validate(draft)→messages`<br>`isEditStartEnabled`<br>`isEmphasisEditable`<br>`onRowCommit(index, value, emphasis)`<br>`onRowAdd(value, emphasis)`<br>`onRowReorder(from, to)` |

### Templates

| Element      | UI                                          | Props                              |
| ------------ | ------------------------------------------- | ---------------------------------- |
| PaneFrame    | fixed-width vertical stack in a side pane   | `width`<br>`children`              |
| PaneSection  | optionally labeled 1–2 column content group | `label`<br>`columns`<br>`children` |
| FieldGrid    | optionally inset rows of label + control    | `rows` (label, control, optional alignment)<br>`inset`<br>`controlWidth` (full \| half)<br>`labelWidth` (compact \| standard) |
| ControlGroup | 1–2 column grouping of controls             | `columns`<br>`spacing` (default \| wide)<br>`children` |

### Primitives

| Element          | Composes     | Props                                                     |
| ---------------- | ------------ | --------------------------------------------------------- |
| TextField        | input (nat)  | `value`<br>`disabled`<br>`invalid`<br>`ariaLabel`<br>`autoFocus`<br>`hasEndAction`<br>`onChange`<br>`onBlur`<br>`onKeyDown` |
| ValidationPopup  | button (nat) | `messages`<br>`onDismiss`                                 |
| TextBlock        | —            | `text`                                                     |
| Button           | button (nat) | `label`<br>`icon`<br>`disabled`<br>`tone` (neutral \| danger)<br>`size` (default \| compact)<br>`alignment` (stretch \| end)<br>`onClick` |
| BackAffordance   | button (nat) | `label`<br>`visible` (hidden state reserves layout space)<br>`onClick` |
| ToggleButton     | button (nat) | `icon`<br>`label` (optional)<br>`title`<br>`pressed`<br>`disabled`<br>`size` (compact \| nodeTile \| relationshipTile)<br>`onClick` |
| StyledBoxSwatch  | —            | `styleValues`<br>`label`                                  |
| BoxOutline       | —            | `variant` (selected \| selectedStripe \| pending)         |
| HaloRing         | —            | `tint`                                                    |
| ResizeAffordance | button (nat) | `onGrab(handle, point)` — handle: nw \| ne \| sw \| se |
| Divider          | —            | —                                                         |

---
# Application

Mapping of library components to domain components. Behaviors described are behaviors of domain components. For behavior of library components used - see "Library components" section

### EditPane/ClassEditPane

Multiple boxes with different styles might be selected

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
| ColorSelect | "Fill"       | current/document/preset color — editable; Default clears | neutral multiple glyph; choosing a color applies to all |
| ColorSelect | "Stroke"     | current/document/preset color — editable; Default clears | neutral multiple glyph; choosing a color applies to all |
| StrokeSelect | "Width"     | current/default/document/standard literal — editable | indeterminate sample; choosing a literal applies to all |
| StrokeSelect | "Dash"      | current/default/document/standard literal — editable | indeterminate sample; choosing a literal applies to all |
| ColorSelect | "Text color" | current/document/preset color — editable; Default clears | neutral multiple glyph; choosing a color applies to all |

Color preset names are exposed as tooltips in the popup. Width and Dash use literal values only.

**PaneFrame › PaneSection** ("Actions")

| Element | Label       | Behavior |
| ------- | ----------- | -------- |
| Button  | "Duplicate" | enabled |
| Button  | "Delete"    | danger tone; Delete key binding |

Buttons are arranged in a two-column `ControlGroup`.

### EditPane/RelationshipEditPane

Single relationship selection only

**PaneFrame › PaneSection** ("Relationship shape")

| Element  | Label             |                                  |
| -------- | ----------------- | -------------------------------- |
| Dropdown | "Source endpoint" | _current endpoint kind_ selected |
| Dropdown | "Line"            | _current line kind_ selected     |
| Dropdown | "Target endpoint" | _current endpoint kind_ selected |
| Button   | "Reverse"         |                                  |

**PaneFrame › PaneSection** ("Multiplicity")

| Element        | Label    | Selected relationship           |
| -------------- | -------- | ------------------------------- |
| CommitComboBox | "Source" | _current multiplicity_ or empty |
| CommitComboBox | "Target" | _current multiplicity_ or empty |

**PaneFrame › PaneSection** ("Relationship label")

| Element                  | Label   | Selected relationship     |
| ------------------------ | ------- | ------------------------- |
| CommitClearableTextField | "Label" | _current label_ or empty  |

**PaneFrame › PaneSection** ("")

| Element | Label       |         |
| ------- | ----------- | ------- |
| Button  | "Duplicate" | enabled |
| Button  | "Delete"    | enabled |
### EditPane/DiagramEditPane

No selection represents the diagram; a named-style selection expands the same pane into style editing. The default `classDef` is displayed separately and is never a selectable named-style chip.

`DiagramView.styles` is a source-ordered discriminated union of declared, direct-class, and namespace style occurrences. Named-style management filters it explicitly to `kind === "declared"`; document-color derivation consumes all kinds.

**PaneFrame top affordance** (style selected with class origin only)

| Element | Label | Behavior |
| ------- | ----- | -------- |
| BackAffordance | "← Back" | restores the originating class selection; hidden state reserves the row so pane content does not shift |

**PaneFrame › PaneSection** ("Saved styles", always mounted)

| Element | No style selected | Named style selected |
| ------- | ----------------- | -------------------- |
| StyledBoxSwatch | default style swatch, or a neutral "No default style" swatch | same |
| SwatchToggle | one per named style, none pressed | one per named style; selected style pressed; click selects without an origin |
| Button | "+ New style" creates a uniquely named initialized style and selects it | same |

Style chips are arranged as full-width rows by `ControlGroup`; the default row has wide spacing before the named-style rows.

**PaneFrame › PaneSection** ("Edit style", named-style selection only)

| Element | Label | Selected style |
| ------- | ----- | -------------- |
| CommitTextField | "Name" | style name — editable |

| Element | FieldGrid label | Selected style |
| ------- | --------------- | -------------- |
| ColorSelect | "Fill" | current/document/preset color — editable; Default clears |
| ColorSelect | "Stroke" | current/document/preset color — editable; Default clears |
| StrokeSelect | "Width" | current/default/document/standard literal — editable |
| StrokeSelect | "Dash" | current/default/document/standard literal — editable |
| ColorSelect | "Text color" | current/document/preset color — editable; Default clears |

Color preset names are exposed as tooltips in the popup. Width and Dash use literal values only.

**PaneFrame › PaneSection** ("Actions", named-style selection only)

| Element | Label | Behavior |
| ------- | ----- | -------- |
| Button | "Set as default" | copies the selected style properties into an independent `classDef default` |
| Button | "Delete style" | danger tone; deletes the definition and its applications |

Buttons are arranged as full-width rows in a one-column `ControlGroup`.

### EditPane/NamespaceEditPane

Single namespace selection only.

**PaneFrame › PaneSection** ("Selected namespace")

| Element         | Label            | Selected namespace                                                     |
| --------------- | ---------------- | ----------------------------------------------------------------------- |
| StyledBoxSwatch |                  | swatch of _namespace style_ if annotation present / *neutral style*     |
| CommitTextField | "Namespace name" | _namespace name_ — editable                                             |

Name renders inside the swatch's label area via the CommitTextField — domain arrangement, not a library composite.

**PaneFrame › PaneSection** ("Namespace style")

| Element     | Label              | @style annotation present            | No @style annotation                 |
| ----------- | ------------------ | ------------------------------------ | ------------------------------------ |
| ColorSelect | "Fill"             | current/document/preset color — editable | quiet token-resolved glyph; Default selected |
| ColorSelect | "Stroke"           | current/document/preset color — editable | quiet token-resolved glyph; Default selected |
| ColorSelect | "Text"             | current/document/preset color — editable | quiet token-resolved glyph; Default selected |
| StrokeSelect | "Stroke width"     | current/default/document/standard literal — editable | renderer/classDef-default sample; Default selected |
| StrokeSelect | "Stroke dasharray" | current/default/document/standard literal — editable | renderer/classDef-default sample; Default selected |
| Button      | "Reset style"      | enabled                              | enabled (reset is a no-op)           |

**PaneFrame › PaneSection** ("")

| Element | Label    |          |
| ------- | -------- | -------- |
| Button  | "Delete" | enabled  |

### EditPane/NoteEditPane

Single note selection only.

**PaneFrame › PaneSection** ("")

| Element | Label                                          | Free note                   | Attached note                        |
| ------- | ---------------------------------------------- | --------------------------- | ------------------------------------ |
| Button  | "Attach to class" / "Detach from class" | "Attach to class" — enabled | "Detach from class" — enabled |
| Button  | "Duplicate"                                    | enabled                     | enabled                              |
| Button  | "Delete"                                       | enabled                     | enabled                              |

### DiagramCanvas/.../ClassBox

**Box shell and overlays**

| Element          | Application behavior                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| BoxOutline       | mounted [selected] with variant `selected`; mounted [pending member during namespace gesture] with variant `pending` |
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
|BoxOutline|mounted [selected] with variant `selected`|
|ResizeAffordance|mounted [selected]|
|CommitTextArea|mounted [text editing]; passed initial value = _note text_|

### DiagramCanvas/.../NamespaceBox

(domain layout; hull box and label band render as domain surface — bounds and colors are runtime values)

| Element          | Application behavior                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| BoxOutline       | mounted [selected] with variant `selected`; mounted [pending member during namespace gesture] with variant `pending` |
| ResizeAffordance | mounted [selected]                                                                                                   |
| CommitTextField  | mounted [name editing]; passed initial value = _namespace name_                                                      |

Resize is a membership gesture, not a bounds edit: the dragged rect selects pending members by overlap; on release bounds re-derive from the new member hull, and the rect itself is never persisted (no-empty-namespace rule applies).

### DiagramCanvas/.../RelationshipEdge

(domain rendering; edge path, endpoint markers, and hit area render as domain SVG — geometry and marker kinds are runtime values)

|Element|Block|Application behavior|
|---|---|---|
|CommitTextField|label|mounted [label set or block editing]; passed initial value = _current label_; edit start enabled [selected]|
|CommitTextField|source multiplicity|mounted [multiplicity set or block editing]; passed initial value = _current multiplicity_; edit start enabled [selected]|
|CommitTextField|target multiplicity|mounted [multiplicity set or block editing]; passed initial value = _current multiplicity_; edit start enabled [selected]|

Non-editing text renders as domain SVG; editing mounts CommitTextField in an HTML overlay positioned at the block. `EditableText` is deleted at the edge migration — no SVG-hosted field variant exists.

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
