# Editor behavior

Product-owner view. Each row is one unambiguous element + event + initial state combination.
Tree structure: blank cells repeat the value from the row above. Implementation columns can be added separately.

## Product decisions applied

- **Source remains the durable artifact.** Visual edits update Mermaid source or Shiny annotations only on explicit commit points: drop, blur/Enter, picker change, button click, or confirmed tool action.
- **Namespace membership is semantic, not geometric.** Dragging a class across a namespace boundary changes only `@spatial`; it does not enter or leave the namespace. Namespaces move by moving all member classes, and namespace geometry is always derived.
- **Relationship geometry is derived.** Users can create, select, label, delete, and reconnect relationships, but cannot manually route or add persistent bend points until a routing annotation exists.
- **Class style edits target the selected class.** Because Mermaid `classDef` can be shared, Shiny creates or assigns a unique class style when needed rather than unexpectedly changing every class that shares a style.
- **Legend is generated UI.** The legend can be shown/hidden in the editor, but it is not a source-backed diagram element in this pass.
- **Notes are out of scope for this pass.** The first-pass note rows are removed/disabled because the specification defines no source syntax for attached or free-floating notes.
- **Single selection for MVP.** Empty-canvas click clears selection. Shift-click/marquee multi-select is not introduced, except temporary rubber-band selection inside namespace creation.
- **Safe degradation wins.** Invalid Mermaid, malformed annotations, orphaned annotations, and write failures never cause silent destructive rewrites.

## Behavior matrix

| Component | Element | Event | Initial state | Cursor | Element behavior | Other behaviors |
|---|---|---|---|---|---|---|
| App shell | Title | Hover | Any view | Default | No element behavior. | No source edit. |
|  | View toggle: Autorender | Click | Editor view active | Default | Switches active view to Autorender. | Renders current source through Mermaid; Shiny annotations are ignored as comments; StylePane and ToolPane are hidden; selection is remembered but inactive; no source edit. |
|  |  | Click | Autorender view already active | Default | No-op. | No source edit. |
|  | View toggle: Editor | Click | Autorender active; source valid and all classes positioned | Default | Switches active view to Editor. | Source is parsed and diagram model evaluated; prior selection is restored by stable element id if the element still exists; otherwise selection clears. |
|  |  | Click | Autorender active; source valid but missing or malformed spatial annotations | Default | Shows Editor problem view instead of canvas. | Lists affected classes and shows Generate; no destructive rewrite until Generate is clicked. |
|  |  | Click | Autorender active; source has unsupported or invalid Mermaid syntax | Default | Shows problem view instead of canvas. | Generate is disabled when Shiny cannot safely identify the diagram model; source is preserved. |
|  |  | Click | Editor view already active | Default | No-op. | No source edit. |
|  | Generate button | Hover | Enabled | Pointer | Button highlights. | No source edit. |
|  |  | Click | One or more classes missing a valid @spatial | Default | Computes non-overlapping positions for missing classes and writes @spatial lines. | Existing valid @spatial lines are preserved; namespace boxes re-derive from member positions; Editor canvas renders after write succeeds. |
|  |  | Click | One or more classes have malformed @spatial | Default | Replaces malformed @spatial for affected classes with generated valid @spatial. | Malformed source line is not silently changed before this click; update is one undoable source edit. |
|  |  | Click | Only duplicate or orphaned annotation warnings exist | Default | Button is hidden or disabled. | Last duplicate still wins; orphaned annotations are preserved and surfaced as diagnostics. |
|  |  | Click | Source has invalid Mermaid syntax | Not-allowed | No-op. | Problem list remains; source is not modified. |
|  | Status diagnostic item | Hover | Diagnostic has source location | Pointer | Diagnostic row highlights. | No source edit. |
|  |  | Click | Diagnostic has source location | Default | Opens/reveals the corresponding source range in VS Code. | Canvas state is unchanged; no source edit. |
|  |  | Click | Diagnostic has no precise source location | Default | Keeps current view and may show explanatory detail. | No source edit. |
| Autorender view | Mermaid canvas | Hover | Diagram rendered | Default | No Shiny selection affordances are shown. | Autorender is informational; it never modifies source. |
|  |  | Drag | Diagram rendered | Panning hand | Pans the rendered Mermaid view. | No source edit. |
|  |  | Scroll or pinch | Diagram rendered | Default | Zooms the rendered Mermaid view around the pointer or viewport center. | No source edit. |
|  | Mermaid element | Click | Diagram rendered | Default | No element selection in Shiny. | StylePane is not shown; no source edit. |
|  | Render error panel | Display | Mermaid renderer fails | Default | Shows Mermaid render error. | Source is preserved; Editor may still show its own problem view depending on parser result. |
| Canvas | Empty area | Hover | No active tool | Default | No visual change. | No source edit. |
|  |  | Click | No element selected; no active tool | Default | No-op. | No source edit. |
|  |  | Click | An element is selected; no active tool | Default | Selection clears. | StylePane clears; no source edit. |
|  |  | Click | Inline edit active and current value valid | Default | Commits inline edit. | Selection remains on edited element; source updates according to the edited semantic or style field. |
|  |  | Click | Inline edit active and current value invalid | Default | Keeps inline editor open and shows validation error. | No source edit. |
|  |  | Click | Class-like placement tool active | Crosshair | Creates the selected class-like element centered at click position. | Adds semantic class declaration plus @spatial; selects the new element; StylePane shows its style. |
|  |  | Click | Relationship creation active with no source endpoint chosen | Crosshair | No relationship is created. | Helper text continues to ask user to choose a source class. |
|  |  | Click | Relationship creation active with source endpoint chosen | Crosshair | Cancels the relationship preview. | No source edit; creation mode remains active unless user presses Escape or selects another tool. |
|  |  | Drag | No active tool | Panning hand | Canvas pans with pointer. | No source edit; current selection is preserved. |
|  |  | Drag | Namespace tool active | Crosshair | Draws a temporary rubber-band selection rectangle. | Classes intersecting the rectangle highlight as candidate namespace members; no source edit until drop/confirm. |
|  |  | Drag-stop | Namespace tool active; one or more classes enclosed | Default | Prompts for namespace name and wraps enclosed classes after confirmation. | Source rewrites those class declarations into the namespace block; class @spatial annotations are preserved; @style for namespace is created with defaults. |
|  |  | Drag-stop | Namespace tool active; no classes enclosed | Default | Rubber-band disappears. | Shows helper that empty namespaces are unsupported because namespace geometry derives from member classes; no source edit. |
|  |  | Scroll or pinch | Any editor state except modal dialog | Default | Zooms canvas around pointer when possible. | No source edit; selection and active tool remain. |
|  |  | Drop | Unsupported external content | Not-allowed | Drop is rejected. | No source edit. |
|  |  | Shift-click | Any selection state | Default | No multi-select in this pass. | Selection remains unchanged unless the clicked target has its own single-select behavior. |
| Class box | Header background | Hover | Pointer over non-text header area | Grab hand | Class outline subtly highlights. | No source edit. |
|  |  | Click | No element selected | Default | Class becomes selected. | StylePane shows class controls; resize handles and relationship anchors appear. |
|  |  | Click | Another element selected | Default | Class becomes selected. | Previous selection clears; StylePane updates to class controls. |
|  |  | Click | This class already selected | Default | Class remains selected. | No toggle-deselect; empty canvas is the deselect gesture. |
|  |  | Drag | Pointer down on non-text header area | Grabbing hand | Class moves with pointer; attached relationship endpoints redraw live. | No source edit during drag; namespace boxes containing this class re-derive live for preview. |
|  |  | Drag-stop | Class not a namespace member | Default | Class locks to final position. | Updates x and y in that class's @spatial; selection remains on class. |
|  |  | Drag-stop | Class is a namespace member | Default | Class locks to final position. | Updates x and y in @spatial; namespace box re-derives around updated member positions. |
|  |  | Drag-stop | Class crosses a namespace visual boundary | Default | Class stays in its existing semantic namespace state. | Only @spatial changes; crossing a boundary does not enter or leave a namespace because namespace membership is semantic, not geometric. |
|  |  | Drag-stop | Class dropped visually inside another namespace | Default | Class stays outside that namespace unless it was already a member. | Target namespace may not expand; show optional hint: use Namespace tool or source edit to change membership. |
|  | Class name text | Hover | Not editing | I-beam | Text highlight affordance appears. | No source edit. |
|  |  | Click | Class not selected | I-beam | Class becomes selected and class-name inline editor opens. | StylePane shows class controls; no source edit until commit. |
|  |  | Click | Class already selected | I-beam | Class-name inline editor opens with text selected or caret placed at click. | No source edit until commit. |
|  |  | Commit inline edit | New name is valid and unique | Default | Class is renamed. | Updates class declaration, relationship references, style application, @spatial id, and namespace membership references in one undoable source edit. |
|  |  | Commit inline edit | New name is invalid or duplicates existing class | I-beam | Inline editor stays open and shows error. | No source edit. |
|  |  | Cancel inline edit | Editing active | Default | Editor closes and original name is restored visually. | No source edit. |
|  | Stereotype text | Hover | Stereotype present | I-beam | Stereotype highlight affordance appears. | No source edit. |
|  |  | Click | Stereotype present | I-beam | Stereotype inline editor opens. | Class is selected; no source edit until commit. |
|  |  | Commit inline edit | Value is valid | Default | Stereotype is updated. | Updates the class body stereotype line in source; StylePane reflects new stereotype. |
|  |  | Commit inline edit | Value is empty | Default | Stereotype is removed. | Removes the stereotype line while preserving class members and @spatial. |
|  | Member row text | Hover | Not editing | I-beam | Member row highlights. | No source edit. |
|  |  | Click | Class not selected | I-beam | Class becomes selected and member inline editor opens for that row. | StylePane shows class controls; no source edit until commit. |
|  |  | Click | Class already selected | I-beam | Member inline editor opens for that row. | No source edit until commit. |
|  |  | Commit inline edit | Member syntax accepted | Default | Member row updates. | Rewrites the corresponding member line in the class body; box reflows; @spatial size is unchanged unless user uses Fit to content. |
|  |  | Commit inline edit | Member text empty | Default | Member row is removed. | Source member line is removed; class box reflows; @spatial size is unchanged unless user uses Fit to content. |
|  |  | Commit inline edit | Member syntax invalid | I-beam | Editor stays open and shows error. | No source edit. |
|  | Add-member row | Hover | Pointer below last member | I-beam | Add-member affordance appears. | No source edit. |
|  |  | Click | Class selected | I-beam | Blank member editor opens. | No source edit until a valid non-empty member is committed. |
|  | Body background | Hover | Pointer over non-text body area | Grab hand | Class outline subtly highlights. | No source edit. |
|  |  | Click | Any other element selected or none selected | Default | Class becomes selected. | StylePane shows class controls; resize handles and relationship anchors appear. |
|  |  | Drag | Pointer down on non-text body area | Grabbing hand | Class moves with pointer; connected relationships redraw live. | No source edit during drag. |
|  |  | Drag-stop | Any namespace membership state | Default | Class locks to final position. | Updates x and y in @spatial; if class is in a namespace, namespace geometry re-derives. |
|  | Border | Hover | Pointer on edge, not on text | Resize arrow for edge | Border highlights and resize affordance appears. | No source edit. |
|  |  | Click | Class not selected | Default | Class becomes selected. | StylePane shows class controls; no resize unless pointer moves past drag threshold. |
|  |  | Drag | Pointer on resizable edge | Resize arrow for edge | Box resizes in dragged dimension; content wraps to current preview width. | No source edit during drag; connected relationships redraw to preview bounds. |
|  |  | Drag-stop | Size at or above minimum | Default | Box locks to final size. | Updates w and/or h in @spatial; if class is in a namespace, namespace geometry re-derives. |
|  |  | Drag-stop | Attempted size below minimum | Default | Box locks to nearest allowed minimum size. | Writes clamped w/h to @spatial; minimum is max(system minimum, content-safe minimum for header controls). |
|  | Resize handle | Hover | Class selected | Directional resize cursor | Handle highlights. | No source edit. |
|  |  | Drag | Class selected | Directional resize cursor | Box resizes in handle direction; width wrapping and height clipping preview live. | No source edit until drag-stop. |
|  |  | Drag-stop | Class selected | Default | Box locks to final clamped size. | Updates w and h in @spatial; one undoable source edit. |
|  | Relationship anchor | Hover | Class selected or relationship tool active | Crosshair | Anchor highlights. | No source edit. |
|  |  | Click | Relationship tool active; no source endpoint chosen | Crosshair | This class becomes relationship source. | Temporary relationship preview begins; no source edit yet. |
|  |  | Click | Relationship tool active; source endpoint already chosen | Crosshair | Creates relationship from chosen source to this target. | Adds relationship line with selected relationship type and optional empty label; selects new relationship. |
|  |  | Drag | Relationship tool active | Crosshair | Starts relationship preview from this class toward pointer. | Candidate targets highlight during drag; no source edit until valid drop. |
| Relationship | Connector line | Hover | No relationship selected | Default | Connector, arrowhead, label, and endpoints highlight. | No source edit. |
|  |  | Click | No element selected | Default | Relationship becomes selected. | StylePane shows relationship semantic controls: type, label, delete. Visual stroke controls stay hidden until edge styling syntax is defined. |
|  |  | Click | Another element selected | Default | Relationship becomes selected. | Previous selection clears; StylePane switches to relationship controls. |
|  |  | Click | This relationship already selected | Default | Relationship remains selected. | No toggle-deselect; empty canvas clears selection. |
|  |  | Drag | Any selection state | Default | No manual route editing. | Relationship path is derived from endpoints; drag on the line itself does not change source. Use endpoint handles to reconnect. |
|  | Arrowhead | Hover | Any selection state | Default | Relationship highlights. | No source edit. |
|  |  | Click | Any selection state | Default | Relationship becomes selected. | StylePane shows relationship semantic controls. |
|  | Endpoint handle | Hover | Relationship selected or connector hovered | Crosshair | Endpoint handle highlights and valid target classes become discoverable on drag. | No source edit. |
|  |  | Drag | Relationship selected | Crosshair | Endpoint detaches visually and follows pointer as a preview. | Other endpoint remains anchored; no source edit during drag. |
|  |  | Drag over | Pointer over valid class | Crosshair | Candidate target class highlights. | No source edit until drop. |
|  |  | Drag-stop | Dropped on valid class | Default | Relationship reconnects to dropped class. | Rewrites relationship source or target while preserving relationship type and label; self-relationship is allowed when explicitly dropped on same class. |
|  |  | Drag-stop | Dropped on empty canvas or invalid target | Default | Endpoint snaps back to original class. | No source edit; relationship remains selected. |
|  | Label | Hover | Label present | I-beam | Label and connector highlight. | No source edit. |
|  |  | Click | Relationship not selected | Default | Relationship becomes selected. | StylePane shows relationship controls; no text edit yet to avoid accidental edits. |
|  |  | Click | Relationship already selected | I-beam | Inline label editor opens. | No source edit until commit. |
|  |  | Double-click | Any selection state | I-beam | Relationship becomes selected and inline label editor opens. | No source edit until commit. |
|  |  | Commit inline edit | Label text valid and non-empty | Default | Relationship label updates. | Rewrites label text after colon in the relationship line. |
|  |  | Commit inline edit | Label text empty | Default | Relationship label is removed. | Relationship line is rewritten without a label colon. |
|  |  | Commit inline edit | Label text invalid for Mermaid parser | I-beam | Editor stays open and shows error. | No source edit. |
|  | Creation preview | Drag | Source endpoint chosen | Crosshair | Preview connector follows pointer. | Valid class targets highlight; no source edit. |
|  |  | Drag-stop | Dropped on valid target class | Default | New relationship is created. | Source appends or inserts relationship line near related class declarations; new relationship becomes selected. |
|  |  | Drag-stop | Dropped on empty canvas or invalid target | Default | Preview is cancelled. | No source edit; relationship tool remains active for another attempt. |
| Namespace | Body | Hover | Pointer over namespace fill not over a class | Grab hand | Namespace outline and label highlight. | No source edit. |
|  |  | Click | No element selected | Default | Namespace becomes selected. | StylePane shows namespace style controls. |
|  |  | Click | Another element selected | Default | Namespace becomes selected. | Previous selection clears; StylePane updates to namespace controls. |
|  |  | Click | Namespace already selected | Default | Namespace remains selected. | No toggle-deselect; empty canvas clears selection. |
|  |  | Drag | Pointer down on namespace fill not on member class | Grabbing hand | All member classes move by the same delta; namespace box re-derives live. | No @style change; no source edit until drag-stop. |
|  |  | Drag-stop | Namespace has one or more member classes | Default | All member classes lock to final positions. | Updates x and y in each member class's @spatial; namespace geometry is not written because it is derived. |
|  |  | Drag-stop | Namespace contains nested or unsupported content | Default | Supported member classes move; unsupported source constructs are preserved. | If Shiny cannot safely rewrite affected spatial annotations, move is rejected and source is unchanged. |
|  | Label background | Hover | Not over editable label text | Grab hand | Namespace highlight appears. | No source edit. |
|  |  | Click | Any selection state | Default | Namespace becomes selected. | StylePane shows namespace style controls. |
|  |  | Drag | Pointer down on label background | Grabbing hand | All member classes move by same delta. | Updates member @spatial annotations on drag-stop. |
|  | Label text | Hover | Namespace selected or label focusable | I-beam | Rename affordance appears. | No source edit. |
|  |  | Click | Namespace not selected | Default | Namespace becomes selected. | No text edit yet; StylePane shows namespace controls. |
|  |  | Click | Namespace already selected | I-beam | Namespace rename editor opens. | No source edit until commit. |
|  |  | Commit inline edit | New namespace name valid and unique in diagram scope | Default | Namespace is renamed. | Rewrites namespace declaration and @style id; class @spatial annotations and relationships are preserved. |
|  |  | Commit inline edit | Name invalid or duplicate | I-beam | Editor stays open and shows error. | No source edit. |
|  | Border | Hover | Any selection state | Grab hand | Border highlights. | No resize cursor because namespace geometry is derived. |
|  |  | Click | Any selection state | Default | Namespace becomes selected. | StylePane shows namespace style controls. |
|  |  | Drag | Pointer down on border | Grabbing hand | All member classes move by same delta. | Member @spatial annotations update on drag-stop. |
|  | Resize handle | Display | Namespace selected | Default | No resize handles are shown. | Namespace has no position or size annotation; fit is derived from member class rectangles plus margin. |
|  | Empty namespace | Render | Namespace exists in source with no positioned member classes | Default | No namespace box is rendered. | Diagnostic explains empty namespaces cannot be manipulated visually until they contain at least one positioned class. |
| Legend | Legend panel | Render | Editor canvas rendered | Default | Legend is generated automatically from present class types and styles. | No source edit; legend position is editor-owned unless a future source annotation is defined. |
|  | Legend item | Hover | Legend visible | Default | Legend item highlights and matching diagram elements are temporarily emphasized. | No source edit; selection is unchanged. |
|  |  | Click | Legend visible | Default | No selection change in this pass. | No source edit; avoids introducing multi-select/filter semantics. |
|  | Legend panel | Drag | Legend visible | Default | No drag behavior in this pass. | Legend is generated UI, not a free-form diagram element. |
| ToolPane | Class tool item | Hover | Editor canvas available | Pointer | Tool item highlights and tooltip shows creation behavior. | No source edit. |
|  |  | Click | Editor canvas available | Crosshair | Enters class placement mode. | Helper asks user to click canvas or drag to place; current selection remains until placement. |
|  |  | Drag | Pointer leaves tool pane | Crosshair | Ghost class follows pointer. | No source edit until drop. |
|  |  | Drop | Dropped on empty canvas | Default | Creates new class at drop position with unique default name. | Adds class declaration and @spatial with default size; selects new class. |
|  |  | Drop | Dropped inside namespace visual box | Default | Creates new class as a member of that namespace. | Adds class declaration inside namespace block plus @spatial at drop position; namespace geometry re-derives. |
|  |  | Drop | Dropped outside canvas or on invalid target | Default | Placement cancels. | No source edit. |
|  | Interface tool item | Click or drag onto canvas | Editor canvas available | Crosshair | Creates class-like element with interface stereotype/default template. | Adds Mermaid class declaration, stereotype line, and @spatial; selects new element. |
|  | Abstract class tool item | Click or drag onto canvas | Editor canvas available | Crosshair | Creates class-like element with abstract-class stereotype/default template. | Adds Mermaid class declaration, stereotype line, and @spatial; selects new element. |
|  | Enumeration tool item | Click or drag onto canvas | Editor canvas available | Crosshair | Creates class-like element with enumeration stereotype/default template. | Adds Mermaid class declaration, stereotype line, and @spatial; selects new element. |
|  | Relationship tool item | Hover | Editor canvas available | Pointer | Tool item highlights and shows relationship type. | No source edit. |
|  |  | Click | Editor canvas available | Crosshair | Enters relationship creation mode for selected relationship type. | Class relationship anchors become discoverable on hover; no source edit. |
|  |  | Drag | From palette to class | Crosshair | If dropped on a class, that class becomes source endpoint and preview begins. | No relationship line is written until target is chosen. |
|  |  | Drop | Dropped outside canvas or not on a class | Default | Creation cancels. | No source edit. |
|  | Relationship type submenu | Click | Relationship creation mode active | Pointer | Changes the pending relationship type. | No source edit until relationship is created. |
|  | Namespace tool item | Hover | Editor canvas available | Pointer | Tool item highlights and tooltip explains wrapping classes. | No source edit. |
|  |  | Click | One or more classes selected or preselected by prior interaction | Default | Prompts for namespace name and wraps selected class(es) after confirmation. | Class @spatial annotations are preserved; source rewrites classes into namespace block; @style annotation is created. |
|  |  | Click | No class selected | Crosshair | Enters namespace selection mode. | User can drag a rubber-band around classes; empty namespace creation is not allowed. |
|  |  | Drop/confirm | Selected classes already belong to another namespace | Default | Asks for confirmation before moving semantic ownership. | On confirm, source rewrites namespace membership; on cancel, no source edit. |
|  | Legend tool item | Click | Legend hidden | Default | Shows auto-generated legend. | No source edit; legend contents are derived from diagram state. |
|  |  | Click | Legend visible | Default | Hides auto-generated legend for this editor session. | No source edit because current spec has no legend persistence annotation. |
|  | Note tool item | Display | Any editor state | Default | Tool is not shown in this pass. | Notes are out of scope because the specification defines no source syntax for free-floating or attached notes. |
| StylePane | Pane body | Render | Nothing selected | Default | Shows empty state or disabled controls. | No source edit. |
|  |  | Render | Class selected | Default | Shows class name, stereotype, class style controls, Fit to content, and Delete element. | Controls reflect effective Mermaid classDef/:::StyleName style plus Shiny spatial size. |
|  |  | Render | Namespace selected | Default | Shows namespace name, namespace @style controls, and Delete element. | Fit to content is hidden/disabled because namespace size is derived. |
|  |  | Render | Relationship selected | Default | Shows relationship type, label, and Delete element. | Fill/stroke/text visual styling controls are hidden until relationship style syntax is defined. |
|  | Name field | Commit | Class selected; new name valid and unique | Default | Renames class. | Same source update as class-name inline rename: declaration, references, style application, and @spatial id update together. |
|  |  | Commit | Namespace selected; new name valid and unique | Default | Renames namespace. | Rewrites namespace declaration and @style id. |
|  |  | Commit | Name invalid or duplicate | Default | Shows validation error and keeps previous value. | No source edit. |
|  | Stereotype control | Change | Class selected | Default | Updates, creates, or removes class stereotype. | Writes semantic class body change; @spatial unchanged. |
|  |  | Change | Namespace or relationship selected | Default | Control hidden or disabled. | No source edit. |
|  | Fill color picker | Click | Class or namespace selected | Default | Color picker opens. | No source edit until value changes. |
|  |  | Change | Class selected | Default | Selected class fill updates visually. | Updates selected class style via classDef/:::StyleName; if current classDef is shared, Shiny creates or assigns a unique classDef for this class to avoid unintended bulk changes. |
|  |  | Change | Namespace selected | Default | Namespace fill updates visually. | Updates fill in @style:<NamespaceId>; namespace geometry unchanged. |
|  |  | Change | Relationship selected or nothing selected | Default | Control unavailable. | No source edit. |
|  | Stroke color picker | Click | Class or namespace selected | Default | Color picker opens. | No source edit until value changes. |
|  |  | Change | Class selected | Default | Selected class stroke updates visually. | Updates classDef/:::StyleName using selected-class-only style edit pipeline. |
|  |  | Change | Namespace selected | Default | Namespace stroke updates visually. | Updates stroke in @style:<NamespaceId>. |
|  |  | Change | Relationship selected or nothing selected | Default | Control unavailable. | No source edit. |
|  | Text color picker | Click | Class or namespace selected | Default | Color picker opens. | No source edit until value changes. |
|  |  | Change | Class selected | Default | Selected class text color updates visually. | Updates color in classDef/:::StyleName using selected-class-only style edit pipeline. |
|  |  | Change | Namespace selected | Default | Namespace label text color updates visually. | Updates color in @style:<NamespaceId>. |
|  |  | Change | Relationship selected or nothing selected | Default | Control unavailable. | No source edit. |
|  | Stroke width input | Commit | Class selected; value valid | Default | Class stroke width updates. | Updates stroke-width in classDef/:::StyleName; if shared style, creates/assigns unique classDef first. |
|  |  | Commit | Namespace selected; value valid | Default | Namespace stroke width updates. | Updates strokeWidth in @style:<NamespaceId>. |
|  |  | Commit | Value invalid | Default | Shows validation error and restores last valid value. | No source edit. |
|  | Stroke dash input | Commit | Class selected; value valid | Default | Class dash pattern updates. | Updates stroke-dasharray in classDef/:::StyleName. |
|  |  | Commit | Namespace selected; value valid | Default | Namespace dash pattern updates. | Updates strokeDasharray in @style:<NamespaceId>. |
|  |  | Commit | Value invalid | Default | Shows validation error and restores last valid value. | No source edit. |
|  | Relationship type control | Change | Relationship selected | Default | Relationship arrow/type updates. | Rewrites relationship line with selected Mermaid arrow syntax while preserving source, target, and label. |
|  | Relationship label field | Commit | Relationship selected; value valid | Default | Relationship label updates. | Rewrites label in relationship line; empty value removes label. |
|  | Fit to content button | Hover | Class selected | Pointer | Button highlights. | No source edit. |
|  |  | Click | Class selected | Default | Class resizes to minimum size that fits header, stereotype, and current members without clipping. | Updates w and h in @spatial; if class is in namespace, namespace geometry re-derives. |
|  |  | Click | Namespace selected | Default | Control hidden or disabled. | Namespace already fits derived member bounds plus margin; no source edit. |
|  |  | Click | Relationship selected or nothing selected | Default | Control hidden or disabled. | No source edit. |
|  | Delete element button | Hover | Any deletable element selected | Pointer | Button highlights. | No source edit. |
|  |  | Click | Class selected | Default | Deletes class after confirmation if needed. | Removes class declaration/body, @spatial, class style application, relationships connected to it, and Shiny-owned unused per-class classDef; preserves shared/manual classDefs. |
|  |  | Click | Relationship selected | Default | Deletes relationship. | Removes relationship line only; classes, styles, and @spatial annotations are preserved. |
|  |  | Click | Namespace selected | Default | Deletes namespace container with safe default of unwrapping member classes. | Moves member class declarations out of namespace, preserves their @spatial and relationships, removes namespace @style; destructive delete-with-contents requires explicit secondary confirmation if offered. |
|  |  | Click | Nothing selected | Default | Control hidden or disabled. | No source edit. |
| Inline editor | Text field | Type | Editing active | I-beam | Text changes locally in editor field. | No source edit until commit. |
|  |  | Enter | Single-line field valid | Default | Commits edit and exits inline editor. | Source updates according to field type; one undoable source edit. |
|  |  | Enter | Member row field valid | I-beam | Commits current member row and opens a new blank member row below. | Source updates current row; blank new row does not write until committed. |
|  |  | Shift+Enter | Member row field valid | Default | Commits member row and exits inline editor. | Source updates current row. |
|  |  | Escape | Editing active | Default | Cancels edit and restores previous value. | No source edit. |
|  |  | Blur | Value valid | Default | Commits edit. | Source updates; selection remains on edited element. |
|  |  | Blur | Value invalid | I-beam | Keeps editor open and shows validation error. | No source edit; focus returns to invalid field when possible. |
|  |  | External source change detected | Editing active | Default | Shows conflict banner and pauses commit. | User must cancel or reload edit before writing; prevents overwriting newer source changes. |
| Keyboard | Escape key | Keydown | Relationship creation, placement, drag, resize, or rubber-band active | — | Cancels active transient operation and restores pre-operation visual state. | No source edit. |
|  |  | Keydown | Inline editor active | — | Cancels inline edit. | No source edit. |
|  |  | Keydown | Element selected; no transient operation | — | Clears selection. | StylePane clears; no source edit. |
|  | Delete or Backspace | Keydown | Class selected; not editing text | — | Invokes class delete behavior. | Same as StylePane Delete element for class. |
|  |  | Keydown | Relationship selected; not editing text | — | Invokes relationship delete behavior. | Same as StylePane Delete element for relationship. |
|  |  | Keydown | Namespace selected; not editing text | — | Invokes namespace delete behavior. | Same as StylePane Delete element for namespace. |
|  |  | Keydown | Text field focused | — | Deletes text in the field. | Does not delete diagram element. |
|  | Enter | Keydown | Class selected; no text editor active | — | Opens primary editable field for the class name. | No source edit until commit. |
|  |  | Keydown | Namespace selected; no text editor active | — | Opens namespace rename editor. | No source edit until commit. |
|  |  | Keydown | Relationship selected; no text editor active | — | Opens relationship label editor. | No source edit until commit. |
|  | Arrow keys | Keydown | Class selected; not editing text | — | Nudges class by 1 canvas unit per key step. | Updates x/y in @spatial; repeated keypresses are grouped into one undoable source edit where possible. |
|  | Shift+Arrow keys | Keydown | Class selected; not editing text | — | Nudges class by 10 canvas units per key step. | Updates @spatial; namespace re-derives if applicable. |
|  | Arrow keys | Keydown | Namespace selected; not editing text | — | Nudges all member classes by 1 canvas unit. | Updates each member @spatial; namespace geometry remains derived. |
|  | Shift+Arrow keys | Keydown | Namespace selected; not editing text | — | Nudges all member classes by 10 canvas units. | Updates each member @spatial. |
|  | Arrow keys | Keydown | Relationship selected; not editing text | — | No move behavior. | Relationship geometry is derived from endpoints; no source edit. |
|  | Space+drag | Pointer drag | Pointer over canvas or element; not editing text | Panning hand | Temporarily pans canvas instead of selecting/moving element. | No source edit. |
|  | Ctrl/Cmd+Z | Keydown | Webview focused; not editing text | — | Requests VS Code undo for last source edit. | After source changes, Shiny re-parses and refreshes active view. |
|  | Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z | Keydown | Webview focused; not editing text | — | Requests VS Code redo. | After source changes, Shiny re-parses and refreshes active view. |
|  | Tab or Shift+Tab | Keydown | Focusable UI visible | — | Moves focus through visible controls in accessible order. | No source edit unless a focused control commits on blur. |
| Source sync | VS Code source document | Change detected | Change originated from Shiny | Default | Canvas already reflects intended local edit. | Source update is applied as one undoable text edit; parser may validate after write without disruptive re-render. |
|  |  | Change detected | Manual or AI edit; user not mid-interaction | Default | Current canvas remains visible during debounce delay. | After debounce, source is parsed and active view refreshes. |
|  |  | Debounced parse complete | Valid source; all class @spatial valid | Default | Canvas updates to new model. | Selection is preserved by element id when possible; otherwise selection clears. |
|  |  | Debounced parse complete | Valid source; new class missing @spatial | Default | Editor switches to missing-annotation problem view. | Lists affected class IDs and shows Generate; existing annotated layout is preserved. |
|  |  | Debounced parse complete | Malformed @spatial | Default | Affected classes treated as missing. | Malformed lines are preserved until Generate replaces them or user edits source manually. |
|  |  | Debounced parse complete | Orphaned @spatial or @style annotation | Default | Canvas renders if otherwise valid and positioned. | Diagnostic is shown; orphaned annotation is preserved, not silently deleted. |
|  |  | Debounced parse complete | Duplicate @spatial for same class | Default | Last annotation wins for rendering. | Warning is shown; duplicates are preserved unless user edits source manually. |
|  |  | Debounced parse complete | Invalid or unsupported Mermaid syntax | Default | Editor shows problem view instead of canvas. | Source is preserved and Shiny does not overwrite file. |
|  |  | Change detected | User is dragging/resizing/creating relationship | Default | Transient operation is cancelled after warning. | Prevents committing a visual edit against a stale source model; user can retry after refresh. |
|  |  | Change detected | Selected element deleted externally | Default | Selection clears after refresh. | StylePane clears. |
|  | Source write | Failure | Shiny attempted source edit and VS Code rejected write | Default | Visual change reverts to last confirmed source state. | Status error explains failure; no partial source state is assumed. |
| Unsupported first-pass items | Attached note | Render | Any source state | Default | No attached note is rendered in this pass. | Specification has no note source syntax; do not create hidden source edits. |
|  | Free-floating note | Render | Any source state | Default | No free-floating note is rendered in this pass. | Shiny is not a free-form drawing tool; notes require a future explicit source syntax. |
|  | Note interactions | Hover/click/drag | Legacy note UI somehow present | Not-allowed | Interaction is disabled. | Show unsupported-feature diagnostic; no source edit. |
|  | Manual edge bend point | Drag | User attempts to drag connector path | Not-allowed | No bend point is created. | No source syntax for persistent edge routing exists in this spec. |
|  | Namespace resize | Drag | User attempts to resize namespace | Not-allowed | No resize occurs. | Namespace geometry is derived from member classes; resize by moving/resizing member classes instead. |

## Source-write rules by action type

| Action type | Source write | Commit timing | Undo granularity |
|---|---|---|---|
| Move class | Update `x` and `y` in `%% @spatial:<ClassId>` | Pointer drag-stop or keyboard nudge batch | One undo step per completed move |
| Resize class | Update `w` and `h` in `%% @spatial:<ClassId>` | Resize drag-stop, Fit to content, or valid style-pane size action | One undo step per completed resize |
| Move namespace | Update `x` and `y` in each member class `@spatial` | Namespace drag-stop or keyboard nudge batch | One undo step for whole namespace move |
| Style class | Update/create `classDef` and `class <ClassId>:::<StyleName>` | Picker/input committed | One undo step per committed property change |
| Style namespace | Update/create `%% @style:<NamespaceId>` | Picker/input committed | One undo step per committed property change |
| Rename class | Rewrite class declaration, relationship references, style application, and `@spatial` id | Inline/style-pane commit | One undo step |
| Edit members | Rewrite class body member line(s) | Inline commit | One undo step per committed row |
| Create class-like element | Add class declaration/body and `@spatial` | Canvas click/drop | One undo step |
| Create namespace | Rewrite selected class declarations into namespace block and add `@style` | Namespace name confirmation | One undo step |
| Create relationship | Add Mermaid relationship line | Valid target drop/click | One undo step |
| Reconnect relationship | Rewrite source or target in relationship line | Endpoint drop on valid class | One undo step |
| Edit relationship label/type | Rewrite relationship line | Inline/style-pane commit | One undo step |
| Delete class | Remove class declaration/body, `@spatial`, connected relationships, class style application, and Shiny-owned unused classDef | Delete confirmation | One undo step |
| Delete relationship | Remove relationship line | Delete click/key | One undo step |
| Delete namespace | Remove namespace wrapper and `@style`; preserve member classes by default | Delete confirmation | One undo step |
| Pan/zoom/show legend | No source write | Immediate UI action | Not part of source undo stack |
