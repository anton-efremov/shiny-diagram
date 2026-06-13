# Refactor Task — Migrate all consumers to DiagramTree model

## Role

You are the **Refactorer** agent. Read your playbook at `docs/agents/refactorer.md`
before starting. Then execute this task in full without waiting for user input.
Both approval gates (scope and implementation plan) are pre-approved by the user.
Proceed directly to implementation.

## Context

The parser-to-component contract has been redesigned. The new model is committed at:

```
webview/src/parsers/classDiagram/diagramTreeModel.ts
```

`diagramModel.ts` no longer exists — it was renamed and redesigned. All consumer
files still reference old types and the build is broken. This task migrates all
consumers to compile cleanly against the new contract.

## New model summary

Read `diagramTreeModel.ts` fully before touching any file. Key changes:

**Renamed/replaced:**

- `DiagramModel` → `DiagramTree` (`nodes: ReadonlyMap<string, TreeNode>` + `edges: readonly TreeEdge[]`)
- `SpatialAnnotation` → `SpatialData` (now an attribute on `ClassNode`, no `classId` field)
- `StyleDef` → `StyleDefNode` (now a `TreeNode` with `kind: "styleDef"`, has `properties: StyleProperty[]` not flat fields)
- `Relationship` → `RelationshipEdge` (now a `TreeEdge` with `kind: "relationship"`)

**Removed from model:**

- `ClassNode.stereotype` → replaced by `ClassNode.annotation?: ClassAnnotation`
- `ClassNode.styleDefName` → style application is now an `AppliesStyleEdge` tree edge

**New types:**

- `TreeNode` — union of `ClassNode | StyleDefNode | NamespaceNode`
- `TreeEdge` — union of `RelationshipEdge | InNamespaceEdge | AppliesStyleEdge`
- `ClassAnnotation` — `{ value: string; location: SourceLocation }`
- `ClassField` — `{ kind: "field"; visibility; name; fieldType?; location }`
- `ClassMethod` — `{ kind: "method"; visibility; name; params?; returnType?; location }`
- `ClassMember` — union of `ClassField | ClassMethod` (replaces old unified type)
- `StyleProperty` — `{ property: "fill"|"stroke"|"color"|"strokeWidth"|"strokeDasharray"; value: string }` (no location)
- `AppliesStyleEdge` — `{ kind: "appliesStyle"; source: string; target: string; location: SourceLocation }`

**Changed:**

- `SourceLocation` — now `{ startLine, startChar, endLine, endChar, raw }` (replaces `{ line, lineCount, raw }`)
- `ClassNode` — added `kind: "class"`, `annotation?: ClassAnnotation`, `spatial?: SpatialData`. Removed `stereotype`, `styleDefName`.
- `ClassBoxProps` — `spatial` removed (now on `ClassNode`), `style` renamed to `styleDef: StyleDefNode`

## Behavior that must remain unchanged

- Drag a class box → `@spatial` annotation updates in the source file
- Fill color change → `classDef` line updates in the source file
- Missing spatial annotations → Generate button appears and inserts annotations
- Autorender mode → unchanged (does not consume DiagramTree)
- `npm run check` passes

## Files to migrate

### `webview/src/parsers/classDiagram/parseResult.ts`

- Replace `DiagramModel` import with `DiagramTree`
- Replace `model: DiagramModel` with `model: DiagramTree` in all variants
- `malformedAnnotations` maps `classId → SourceLocation` — `SourceLocation` shape changed,
  update any construction sites that use `{ line, raw }` to `{ startLine, startChar, endLine, endChar, raw }`

### `webview/src/parsers/classDiagram/rules/parseClasses.ts`

- `ClassMember` is now `ClassField | ClassMethod` — split `parseFieldMember` to return
  `ClassField` with `kind: "field"` and `fieldType?` (was `type`), and `parseMethodMember`
  to return `ClassMethod` with `kind: "method"`, `params?`, `returnType?` (was `type`)
- Remove `isMethod` from all return values
- `ClassNode` no longer has `stereotype` — use `annotation?: ClassAnnotation` instead.
  Capture stereotype line number to build `SourceLocation` for `ClassAnnotation`.
- `ClassNode` no longer has `styleDefName` — the second pass that attaches style must
  instead build an `AppliesStyleEdge` and return it separately. Update the return type
  of `parseClasses` to `{ nodes: ClassNode[]; appliesStyleEdges: AppliesStyleEdge[] }`.
- All `SourceLocation` literals: replace `{ line: N, raw }` with
  `{ startLine: N, startChar: 0, endLine: N, endChar: line.raw.length, raw }`

### `webview/src/parsers/classDiagram/rules/parseRelationships.ts`

- Replace `Relationship` import with `RelationshipEdge`
- Add `kind: "relationship"` to each returned object
- Update `SourceLocation` literals as above

### `webview/src/parsers/classDiagram/rules/parseStyles.ts`

- Replace `StyleDef` import with `StyleDefNode`
- `StyleDefNode` has `id` (not `name`) and `properties: StyleProperty[]` (not flat fields)
- Rewrite return to build `StyleProperty[]` array from parsed key/value pairs
- Add `kind: "styleDef"` and `id: name` to returned objects
- Update `SourceLocation` literals as above

### `webview/src/parsers/classDiagram/rules/parseSpatial.ts`

- Replace `SpatialAnnotation` import with `SpatialData`
- `SpatialData` has no `classId` field — classId is the Map key, not stored on the value
- `MalformedAnnotation` still needs `classId` for the Map key — keep it locally, do not
  store it on `SpatialData`
- Update `SourceLocation` literals as above

### `webview/src/parsers/classDiagram/index.ts`

- Replace `DiagramModel` import with `DiagramTree`
- Update `parseClasses` call — it now returns `{ nodes, appliesStyleEdges }`
- Replace `parseRelationships` return type with `RelationshipEdge[]`
- Replace `parseStyles` return type with `StyleDefNode[]`
- Assemble `DiagramTree`:
  - `nodes`: a single `Map<string, TreeNode>` containing all `ClassNode` entries
    (keyed by class id) and all `StyleDefNode` entries (keyed by style id).
    `NamespaceNode` entries are not yet populated — omit them.
  - `edges`: array of all `RelationshipEdge` + all `AppliesStyleEdge` entries.
    `InNamespaceEdge` entries are not yet populated — omit them.
- Spatial: attach each `SpatialData` directly onto its `ClassNode` by mutating
  the node map after assembly, or build `ClassNode` with spatial inline.
  `SpatialData` goes on `ClassNode.spatial`.
- Missing annotations check: a class is missing spatial if its `ClassNode.spatial`
  is undefined. Collect those ids for the `missingAnnotations` error variant.
- `malformedAnnotations` map: keyed by classId → `SourceLocation` of the malformed line.
  Build from `parseSpatial` malformed list.
- Remove old `DiagramModel` assembly (`classes`, `styleDefinitions`, `spatialAnnotations` maps).

### `webview/src/parsers/classDiagram/formatSpatial.ts`

- Replace `SpatialAnnotation` import with `SpatialData`
- Parameter type: `SpatialData` (no `classId` field)
- The function reconstructs the annotation line — it needs `classId` to do so.
  Add `classId: string` as a second parameter.
  Signature becomes: `formatSpatialAnnotation(spatial: SpatialData, classId: string, x: number, y: number): string`

### `webview/src/parsers/classDiagram/formatStyleDef.ts`

- Replace `StyleDef` import with `StyleDefNode`
- `StyleDefNode` has `id` not `name` — update `style.name` references to `style.id`
- `style.location.raw` still exists — keep it. But `SourceLocation` shape changed —
  `location.raw` is still present so this access is fine.
- `style.fill` no longer exists as a flat field — style properties are in `style.properties`.
  Helper to get a property value: `style.properties.find(p => p.property === "fill")?.value`
  Update `formatStyleDefFill` to use this lookup when building the replacement line.

### `webview/src/components/Layout/Layout.tsx`

- Replace `DiagramModel` import with `DiagramTree`
- `computeGenerateEdits` currently reads `model.spatialAnnotations` — replace with:
  iterate `model.nodes`, filter to `kind === "class"`, check `node.spatial` is undefined
  for missing, read `node.spatial.location` for existing anchor computation.
- `malformedAnnotations` map values are `SourceLocation` — replace `.line` accesses
  with `.startLine`
- `model.spatialAnnotations.size` → count of class nodes that have `spatial` defined
- Anchor line computation: replace `a.location.line` with `a.location.startLine`

### `webview/src/components/Layout/EditorMode/EditorMode.tsx`

- Remove `ClassBoxProps` and `Relationship` imports from `diagramTreeModel`
- Define `ClassBoxProps` locally in this file (it was removed from the model):
  ```typescript
  type ClassBoxProps = {
    readonly node: ClassNode;
    readonly styleDef?: StyleDefNode;
  };
  ```
- Import `ClassNode`, `StyleDefNode`, `RelationshipEdge`, `AppliesStyleEdge` from `diagramTreeModel`
- `model` is now `DiagramTree` — get it via `parseResult.model` (type is `DiagramTree`)
- `classBoxes` useMemo: iterate `model.nodes`, filter `kind === "class"`, for each
  `ClassNode` that has `spatial` defined, resolve `styleDef` by finding an
  `AppliesStyleEdge` in `model.edges` where `source === node.id`, then look up
  `model.nodes.get(edge.target)` cast to `StyleDefNode`.
- `relationships` useMemo: filter `model.edges` to `kind === "relationship"`, cast to
  `RelationshipEdge[]`, filter to those where both source and target class nodes have
  `spatial` defined.
- `handleNodeDragStop`: `box.spatial` → `box.node.spatial`. Pass `box.node.id` as
  `classId` to `formatSpatialAnnotation`. Line number: `box.node.spatial.location.startLine`.
- `handleFillColorChange`: `selectedClassBox?.style` → `selectedClassBox?.styleDef`.
  Line number: `selectedClassBox.styleDef.location.startLine`.

### `webview/src/components/Layout/EditorMode/ClassDiagram/ClassDiagram.tsx`

- Remove `ClassBoxProps` and `Relationship` imports from `diagramTreeModel`
- Import `ClassNode`, `StyleDefNode`, `RelationshipEdge` from `diagramTreeModel`
- Define `ClassBoxProps` locally (same shape as EditorMode — consider extracting to a
  shared local type or just duplicate; do not put it back in diagramTreeModel)
- `toNodes`: `box.spatial.x` → `box.node.spatial!.x` etc. Spatial is guaranteed present
  here because EditorMode only passes boxes with spatial defined.
- `toEdges`: parameter type `RelationshipEdge[]` (was `Relationship[]`)
- `chooseSourceSide`: `source.spatial.x` → `source.node.spatial!.x` etc.

### `webview/src/components/Layout/EditorMode/ClassDiagram/ClassBox/ClassBox.tsx`

- Remove `ClassBoxProps` import from `diagramTreeModel`
- Define `ClassBoxProps` locally or import from a shared location
- `data.style` → `data.styleDef`
- Style property access: `style.fill` → `styleDef.properties.find(p => p.property === "fill")?.value`
  Same for `stroke` and `color`. Extract a helper `getStyleProp(styleDef, property)` for clarity.
- `node.stereotype` → `node.annotation?.value`
- `ClassMember` is now `ClassField | ClassMethod` — update `formatMember`:
  - `member.isMethod` → `member.kind === "method"`
  - `member.params` → only accessible when `member.kind === "method"`
  - `member.type` (return type) → `member.returnType` when method, `member.fieldType` when field
- `MemberList` key: `member.location.line` → `member.location.startLine`
- Filter fields/methods: `member.kind === "field"` / `member.kind === "method"`

### `webview/src/components/Layout/EditorMode/StylePane/StylePane.tsx`

- Remove `ClassBoxProps` import from `diagramTreeModel`
- Define or import `ClassBoxProps` locally
- `selectedClassBox.style` → `selectedClassBox.styleDef`
- `style.fill` → `styleDef.properties.find(p => p.property === "fill")?.value`
  Same for `stroke` (`color` in StyleDefNode maps to text color) and `color`
- `style.name` → `styleDef.id`
- `node.stereotype` → `node.annotation?.value`

## ClassBoxProps placement

`ClassBoxProps` was removed from `diagramTreeModel.ts`. It is a rendering concern,
not a parser concern. Define it once in `EditorMode.tsx` and pass it to child
components via props. `ClassDiagram.tsx`, `ClassBox.tsx`, and `StylePane.tsx` should
import it from `EditorMode.tsx` or each define it locally — whichever is cleaner.
Do not put it back in `diagramTreeModel.ts`.

## Verification

After all changes, run:

```
npm run check
```

All type errors must be resolved. No `@ts-ignore` allowed. Report the result.
