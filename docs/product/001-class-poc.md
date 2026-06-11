# Sprint 001 — Class Diagram PoC

## 1. Goal

- Build first end-to-end Shiny demo.
- Establish scalable project architecture
  - stack;
  - folder structure;
  - design-system structure;
- Establish scalable project harness:
  - build workflow;
  - agent workflow;
- Obtain data point on project complexity to estimate timeline for full development

## 2. Scope

### 2.1 Supported

- Mermaid class diagrams only.
- Fully annotated diagrams only.
- Source file is valid Mermaid.
- Two working editor->code actions:
  - move class box - changing annotation;
  - change class color - changing native Mermaid style.
- Three working code->editor actions:
  - change position;
  - change size;
  - change class color.
- Full editor shell visible with target elements and toolkit; non-implemented tools visible but disabled / coming soon.

### 2.2 Not supported

- Missing annotation completion.
- Adding / deleting elements.
- Editing text.
- Adding/deleting relationships.
- Resize via editor (via code - in scope)
- Elements other than classes and connections

## 3. Supported journeys

### 3.1 Open diagram

- User opens fully annotated `.mmd` class diagram.
- User opens Shiny from VS Code.
- Shiny opens WebView beside code pane.
- WebView shows full product shell.
- Editor mode renders class boxes and relationships.
- Autorenderer mode renders standard Mermaid output.

### 3.2 Move class box

- User enters Editor mode.
- User drags class box.
- Shiny updates matching `@spatial`.
- Only `x` and `y` change.
- `w` and `h` stay unchanged.
- Source remains valid Mermaid.

```js
%% @spatial:TextMessage x=540 y=220 w=300 h=250
```

### 3.3 Change class color

- User selects class box.
- User changes fill color from styles pane.
- Shiny updates Mermaid-native style syntax in source file.
- Shiny does not store color in `@spatial`.
- Shiny re-renders editor canvas immediately with new fill color — no manual re-render required.
- Autorenderer mode, if active, becomes stale; status shows `⚠ Stale`.

```js
class TextMessage:::ShinyTextMessageStyle
classDef ShinyTextMessageStyle fill:#DFF7FF,stroke:#2563EB,color:#111827
```

### 3.4 Edit source manually

- User edits Mermaid source directly:
  - new classes
  - new connections
  - change style
  - change position 
  - change size
- WebView status becomes `Rendering`.
- Shiny waits briefly for typing to settle.
- Shiny re-renders active mode automatically.
- Status becomes `Rendered` or `Error`.

## 4. Features

### 4.1 Extension host

- Register `Shiny: Open Diagram`.
- Icon/action on `.mmd` editor panes.
- Read active `.mmd` document.
- Create/manage WebView panel.
- Send source/model data to WebView.
- Receive visual edit events from WebView.
- Patch source file.
- Distinguish Shiny-originated source edits from manual edits.
- Debounce manual source edits — 500ms idle after last keystroke before re-render triggers.
- Trigger automatic re-render after debounce.
- Report render/parse state to WebView.
- Own all source mutation.

### 4.2 Code pane

- Native VS Code editor pane — no custom implementation.
- Displays and edits the `.mmd` source file directly.
- Remains the single source of truth for all diagram state.
- User edits are standard VS Code text editing — no Shiny UI involved.
- Shiny reads from this pane; all source mutations by Shiny are written back to this file via the Extension Host.
- Use `@spatial` only for layout.
- Use Mermaid-native syntax for styles.

### 4.3 WebView pane

#### 4.3.1 Layout

- Header:
  - file name;
  - diagram type;
  - mode toggle;
  - render status.
- Body:
  - active mode surface.

#### 4.3.2 Autorenderer

- Static picture from standard Mermaid renderer.

#### 4.3.3 Editor

- Excalidraw-like class-diagram editor.
- Full editor shell visible.
- Only sprint-enabled actions:
  - move class box;
  - change class fill color.
- Non-enabled actions:
  - no source mutation;
  - the rest of behavior as of enabled elements - visible, clickable, hover shows element name

##### 4.3.3.a Tool pane

- Visual properties:
  - Location: left side of Editor mode;
  - Shape: vertical compact pane with icons;
  - Icons: corresponding UML shape as an icon;
  - On hover: displays element name.

- Elements:
  - Class button (`class X { ... }`)
  - Annotated class dropdown:
    - Interface (`class X { <<Interface>> ... }`)
    - Abstract class (`class X { <<Abstract>> ... }`)
    - Enumeration (`class X { <<Enumeration>> ... }`)
    - Service (`class X { <<Service>> ... }`)
    - Custom annotation (`class X { <<Custom>> ... }`)
  - Namespace/group button (`namespace X { ... }`)
  - Note/comment object button (`note "..."` / `note for X "..."`)
  - Relationship dropdown:
    - association (`A --> B`);
    - solid link (`A -- B`);
    - dashed link (`A .. B`);
    - inheritance (`A <|-- B`);
    - composition (`A *-- B`);
    - aggregation (`A o-- B`);
    - dependency (`A ..> B`);
    - realization (`A ..|> B`);
    - labeled relationship (`A --> B : label`);
    - multiplicity relationship (`A "1" --> "*" B : label`);
    - two-way relationship (`A <|--|> B`);
    - lollipop interface (`foo --() Interface`, `Interface ()-- foo`).

##### 4.3.3.b Styles pane

- Visual properties:
  - Location: right side of Editor mode;
  - Contents: depending on selected top-level object;
  - Empty selection: empty pane.

- Elements:
  - Common elements across selected objects:
    - delete element

  - Class object (`class X { ... }`, `class X:::StyleName`, `classDef StyleName ...`):
    - fill color dropdown (`classDef StyleName fill:#...`) - the only enabled
    - stroke color dropdown (`classDef StyleName stroke:#...`)
    - text color dropdown (`classDef StyleName color:#...`)
    - stroke width dropdown (`classDef StyleName stroke-width:...`)
    - stroke dash dropdown (`classDef StyleName stroke-dasharray:...`)
    - interaction/link button:
      - link (`link X "https://..." "tooltip"`)
      - callback (`callback X "callback" "tooltip"`)
      - click href (`click X href "https://..." "tooltip"`)
      - click callback (`click X call callback() "tooltip"`)

  - Annotated class object (`class X { <<Interface>> ... }`, `class X { <<Abstract>> ... }`, `class X { <<Enumeration>> ... }`, `class X { <<Service>> ... }`):
    - fill color dropdown (`classDef StyleName fill:#...`)
    - stroke color dropdown (`classDef StyleName stroke:#...`)
    - text color dropdown (`classDef StyleName color:#...`)
    - stroke width dropdown (`classDef StyleName stroke-width:...`)
    - stroke dash dropdown (`classDef StyleName stroke-dasharray:...`)
    - annotation dropdown:
      - interface (`<<Interface>>`)
      - abstract (`<<Abstract>>`)
      - enumeration (`<<Enumeration>>`)
      - service (`<<Service>>`)
      - custom annotation (`<<Custom>>`)
    - interaction/link button:
      - link (`link X "https://..." "tooltip"`)
      - callback (`callback X "callback" "tooltip"`)
      - click href (`click X href "https://..." "tooltip"`)
      - click callback (`click X call callback() "tooltip"`)

  - Relationship object (`A --> B : label`):
    - relationship type dropdown:
      - association (`A --> B`)
      - solid link (`A -- B`)
      - dashed link (`A .. B`)
      - inheritance (`A <|-- B`)
      - composition (`A *-- B`)
      - aggregation (`A o-- B`)
      - dependency (`A ..> B`)
      - realization (`A ..|> B`)
      - labeled relationship (`A --> B : label`)
      - multiplicity relationship (`A "1" --> "*" B : label`)
      - lollipop interface (`foo --() Interface`, `Interface ()-- foo`)
    - line color dropdown - future / no stable Mermaid classDiagram syntax selected yet
    - line style dropdown - future / no stable Mermaid classDiagram syntax selected yet

  - Note/comment object (`note "..."`, `note for X "..."`):
    - no style-pane controls defined yet

  - Namespace/group object (`namespace X { ... }`, `namespace X["Label"] { ... }`):
    - no style-pane controls defined yet

##### 4.3.3.c Class box — `class X { ... }`, `class X:::StyleName`

- Visual properties:
  - Header section: class name centered, stereotype label if present (`<<interface>>`, `<<abstract>>`, `<<enumeration>>`);
  - Body section: fields listed first, then divider, then methods;
  - Visibility prefix rendered per member (`+` public, `-` private, `#` protected, `~` package);
  - Fill color from `classDef` applied to header and body background;
  - Stroke color from `classDef` applied to outer frame;
  - Text color from `classDef` applied to all text;
  - Selected state: outer frame highlighted with selection color + resize handles visible at corners and edges.

- Elements:

  - Outer frame:
    - on hover (unselected): highlight border. (ENABLED)
    - on click: select box, show resize handles, populate styles pane. (ENABLED)
    - on click-and-hold (unselected): move box, update `@spatial` x/y on release. (ENABLED)
    - on click-and-hold (selected, not on handle): move box, update `@spatial` x/y on release. (ENABLED)

  - Resize handles (8 handles: N/S/E/W/NE/NW/SE/SW):
    - on hover: show directional resize cursor. (DISABLED)
    - on click-and-hold: resize box, update `@spatial` w/h on release. (DISABLED)

  - Header text box (class name):
    - on hover: show tooltip with full class name. (ENABLED)
    - on click: select parent box. (ENABLED)
    - on double-click: enter inline text edit mode for class name. (DISABLED)

  - Stereotype label (`<<interface>>`, `<<abstract>>` etc):
    - on hover: show tooltip with stereotype name. (ENABLED)
    - on click: select parent box. (ENABLED)
    - on double-click: open stereotype picker. (DISABLED)

  - Field row (`+UUID id`, `-String name` etc):
    - on hover: highlight row, show tooltip with full field signature. (ENABLED)
    - on click: select parent box. (ENABLED)
    - on double-click: enter inline text edit for that field. (DISABLED)

  - Method row (`+addMessage(TextMessage) void` etc):
    - on hover: highlight row, show tooltip with full method signature. (ENABLED)
    - on click: select parent box. (ENABLED)
    - on double-click: enter inline text edit for that method. (DISABLED)

  - Fields/methods divider line:
    - on hover: no effect. (ENABLED)
    - on click: select parent box. (ENABLED)

  - Add-field affordance (bottom of fields section):
    - on hover over bottom edge of last field row: show `+` icon. (DISABLED)
    - on click `+`: append new blank field row, enter inline edit. (DISABLED)

  - Add-method affordance (bottom of methods section):
    - on hover over bottom edge of last method row: show `+` icon. (DISABLED)
    - on click `+`: append new blank method row, enter inline edit. (DISABLED)

  - Add-member affordance (empty body, no fields or methods):
    - on hover over body area: show centered `+` icon. (DISABLED)
    - on click `+`: show picker — add field or add method. (DISABLED)

##### 4.3.3.d Relationship edge — `A --> B`, `A -- B`, `A .. B`, `A <|-- B`, `A *-- B`, `A o-- B`, `A ..> B`, `A ..|> B`, `A "1" --> "*" B`, `A <|--|> B`, `foo --() Interface`

- Visual properties:
  - Line style reflects relationship type:
    - solid line: association, inheritance, composition, aggregation, two-way;
    - dashed line: dependency, realization, dashed link;
  - Arrowhead reflects relationship type:
    - open arrow: association, dependency;
    - closed triangle: inheritance, realization;
    - filled diamond: composition;
    - open diamond: aggregation;
    - both ends: two-way (`A <|--|> B`);
    - lollipop circle: interface notation (`foo --() Interface`);
    - no arrowhead: solid link, dashed link;
  - Multiplicity labels rendered at each end if present (`"1"`, `"*"`, `"0..1"` etc);
  - Relationship label rendered centered on line if present (`: label`);
  - Color from `linkStyle N stroke:#...` if defined in source;
  - Selected state: line highlighted with selection color, endpoints marked.

- Elements:

  - Edge line:
    - on hover: highlight line, show tooltip with relationship type, label, and multiplicity. (ENABLED)
    - on click: select edge, populate styles pane. (ENABLED)
    - on double-click: open relationship type picker. (DISABLED)

  - Relationship label text box (`: label`):
    - on hover: highlight label, show tooltip with full label text. (ENABLED)
    - on click: select parent edge. (DISABLED)
    - on double-click: enter inline text edit for label. (DISABLED)

  - Multiplicity label (source end):
    - on hover: show tooltip with multiplicity value. (ENABLED)
    - on click: select parent edge. (DISABLED)
    - on double-click: enter inline edit for source multiplicity. (DISABLED)

  - Multiplicity label (target end):
    - on hover: show tooltip with multiplicity value. (ENABLED)
    - on click: select parent edge. (DISABLED)
    - on double-click: enter inline edit for target multiplicity. (DISABLED)

  - Arrowhead:
    - on hover: show tooltip with relationship type name. (ENABLED)
    - on click: select parent edge. (DISABLED)

  - Lollipop circle (`foo --() Interface`):
    - on hover: show tooltip with interface name. (ENABLED)
    - on click: select parent edge. (DISABLED)

##### 4.3.3.e Zoom controls

- Visual properties:
  - Location: bottom-right corner of editor canvas;
  - Shape: compact horizontal group — zoom out, zoom level readout, zoom in, reset;
  - Zoom level readout: shows current zoom as percentage (e.g. `100%`).

- Elements:

  - Zoom in button (`+`):
    - on click: increase zoom by fixed step (25%); (ENABLED)
    - on click at max zoom: no effect, button visually disabled. (ENABLED)

  - Zoom out button (`−`):
    - on click: decrease zoom by fixed step (25%); (ENABLED)
    - on click at min zoom: no effect, button visually disabled. (ENABLED)

  - Zoom level readout:
    - on hover: show tooltip `current zoom level`. (ENABLED)
    - on click: enter manual zoom value input. (DISABLED)

  - Reset zoom button (`100%` or fit-to-screen icon):
    - on click: reset zoom to 100% and re-center canvas. (ENABLED)

  - Scroll wheel on canvas:
    - behavior: zoom in/out centered on cursor position. (ENABLED)

  - Pinch gesture on canvas (trackpad):
    - behavior: zoom in/out centered on gesture midpoint. (ENABLED)

##### 4.3.3.f Undo / redo controls

- Visual properties:
  - Location: header bar, left of mode toggle;
  - Shape: two icon buttons — undo (`↩`), redo (`↪`);
  - Disabled state: button visually dimmed when history is empty.

- Elements:

  - Undo button (`↩`):
    - on hover: show tooltip `Undo (Ctrl+Z / ⌘Z)`. (DISABLED)
    - on click: revert last source mutation, update canvas. (DISABLED)
    - keyboard shortcut `Ctrl+Z` / `⌘Z`: same as click. (DISABLED)

  - Redo button (`↪`):
    - on hover: show tooltip `Redo (Ctrl+Shift+Z / ⌘⇧Z)`. (DISABLED)
    - on click: reapply last reverted mutation, update canvas. (DISABLED)
    - keyboard shortcut `Ctrl+Shift+Z` / `⌘⇧Z`: same as click. (DISABLED)

##### 4.3.3.g Cursor

- Click on empty canvas:
  - Icon: arrow;
  - Behavior: reset selection. (ENABLED)

- Click-and-hold on empty canvas:
  - Icon: hand;
  - Behavior: pan canvas. (ENABLED)

- Hover over class box border (no selection):
  - Icon: arrow;
  - Behavior: highlight box border. (ENABLED)

- Click on class box border:
  - Icon: arrow;
  - Behavior: select box, show resize handles, show styles pane for class box. (ENABLED)

- Click-and-hold on class box:
  - Icon: grabbing hand;
  - Behavior: move box, update `@spatial` x/y in source on release. (ENABLED)

- Hover over resize handle:
  - Icon: directional resize arrow (N/S/E/W/NE/NW/SE/SW depending on handle);
  - Behavior: indicate resize affordance. (DISABLED)

- Click-and-hold on resize handle:
  - Icon: directional resize arrow;
  - Behavior: resize box, update `@spatial` w/h in source on release. (DISABLED)

- Hover over relationship edge:
  - Icon: arrow;
  - Behavior: highlight edge. (ENABLED)

- Click on relationship edge:
  - Icon: arrow;
  - Behavior: select edge, populate styles pane. (ENABLED)

- Hover over tool pane icon:
  - Icon: arrow;
  - Behavior: show tooltip with element name. (DISABLED)

- Click on tool pane icon:
  - Icon: crosshair;
  - Behavior: enter element placement mode, click on canvas places new element. (DISABLED)

- Hover over styles pane control:
  - Icon: arrow;
  - Behavior: show tooltip with control description. (ENABLED for fill color, DISABLED for all others)

- Hover over note/comment object:
  - Icon: arrow;
  - Behavior: highlight border, show tooltip with note text. (DISABLED)

- Click on note/comment object:
  - Icon: arrow;
  - Behavior: select note, populate styles pane. (DISABLED)

- Hover over namespace/group:
  - Icon: arrow;
  - Behavior: highlight namespace border. (DISABLED)

- Click on namespace/group:
  - Icon: arrow;
  - Behavior: select namespace, populate styles pane. (DISABLED)
