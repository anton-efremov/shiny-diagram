## Persistent facts

#### Spatial position

**Membership is the only persisted fact.** A namespace has no spatial annotation of its own — its box is derived, every render, from its members:

```
bounds(namespace) = hull(member class boxes ∪ child namespace boxes) + MARGIN
```

- `MARGIN` is a global constant; nesting compounds it per level (child hull + margin is an input to the parent hull)
- Membership lives in Mermaid source (`namespace Domain { class User }`); positions of member class boxes live in class `@spatial` annotations; the namespace box is a pure function of both — the file cannot hold a contradictory namespace state by construction


#### Style

Unlike for class boxes, Mermaid does not support per-namespace styling natively — `@style` is a Shiny extension stored as a comment.

**Format**

```
%% @style:<NamespaceId> fill=<value> stroke=<value> color=<value> strokeWidth=<value> strokeDasharray=<value>
```

**Rules**

- `@style` + namespace ID + key=value pairs on a single comment line
- namespace ID is the Mermaid namespace name
- supported properties mirror Mermaid's `classDef` properties: `fill`, `stroke`, `color`, `strokeWidth`, `strokeDasharray`

## Create namespace

**Happy path:** 
→ namespace tool in ToolPane 
→ drag a rect on canvas
→ top level boxes (parentless Class or parentless Namespace) that rect touches/crosses are highlighted (green outline) as pending members 
→ release 
	- Namespace is created with an allocated name (`NewNamespace` convention, as with classes) fully embracing pending members. 
	- Box size and position is derived from pending members as hull + margin (thus there is a "jump" in box size and position)
	- Members highlight disappears
	- Namespace is selected

**Cancel path:** 
 "Esc" OR release with nothing highlighted → Nothing is created

## Resize namespace

→ Select namespace by pressing in namespace area outside of member elements - resize handles appear
→ Every **top level** (parentless Class or parentless Namespace) box inside gets highlighted with green outline (inclusion). Non top-level boxes get "a hallo" of their parent namespace
→ On resizing, boxes that are partially overlap with namespace rect get highlighted with green outline, boxes that stop overlapping - stop being highlighted
→ On release - box size and position is derived from pending members, members highlight disappears, namespace is selected
→ if no members left - namespace is erased from screen and from source (no empty Namespace rule)

## Handle inconsistent layout

There might be a layout, when spatial position for a Namespace derived from its member is inconsistent, because it overlaps with non-members.

In this case, non-member carry "a hallo" of its parent namespace (or none) - a padding of the color of its parent namespace

## Move namespace

→ drag anywhere in namespace area outside of member elements
→ all member boxes move together; namespace box follows by derivation
→ Namespace stays selected

## Move box in/out of namespace

**Drag in:** 
→ drag a box (class or namespace); when its box overlaps with namespace box, that box is highlighted with green outline 
→ drop class or namespace - it becomes a member; 
→ namespace box re-derives

**Drag out:** 
→ drag a box (class or namespace) - no highlighting for now
→ drop class or namespace when still overlapping - it remains a member; 
→ drop class or namespace when not overlapping - it stops being a member; 
→ namespace box re-derives
→ if no members left - namespace is erased from screen and from source (no empty Namespace rule)

## Change properties of namespace

Only one namespace can be selected:
- Ctrl+click on another element switches selection to another element

On selection, EditPane displays:

**Section Name:**

name - text area, commit on enter or click outside with validity check

**Section Style**

Style-selectors with the Namespace's style values preset: changes the Namespace's style
Button "Reset style": erases style annotation and applies default style

**Section Control**

Button \[Delete] - deletes only namespace, not members




