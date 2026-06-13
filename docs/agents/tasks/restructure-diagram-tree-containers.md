# Refactor Task — Split DiagramTree into typed containers + implicit class synthesis

## Context

Two changes to `DiagramTree`:

1. **Typed containers.** `DiagramTree.nodes` (a `Map<TreeNodeId, TreeNode>` mixing
   three node kinds) and `DiagramTree.edges` (an array mixing three edge kinds)
   force every consumer to filter by `kind` and type-narrow. Replace with six
   separate typed containers — three node maps, three edge arrays. Consumers then
   read exactly the collection they need with no filtering.

2. **Implicit class synthesis.** Mermaid allows a class to be referenced only via
   a relationship with no explicit `class Foo` declaration (e.g. `Animal <|-- Duck`
   is valid even if neither class is declared). Currently such relationship
   endpoints are dangling — absent from `model.nodes`. Add a synthesis step that
   creates minimal `ClassNode` entries for any relationship endpoint not otherwise
   declared, with `location: null` (no declaration exists in source).

## Step 1 — Update diagramTreeModel.ts

### ClassNode.location becomes nullable

```typescript
export type ClassNode = {
  readonly kind: "class";
  readonly id: ClassId;
  readonly annotation?: ClassAnnotation;
  readonly members: readonly ClassMember[];
  readonly spatial?: SpatialData;
  /**
   * The "class Foo {" or "class Foo" declaration line.
   * Null for classes synthesized from relationship endpoints that have
   * no explicit declaration in source.
   */
  readonly location: SourceLocation | null;
};
```

### DiagramTree gets typed containers

Replace:

```typescript
export type DiagramTree = {
  readonly nodes: ReadonlyMap<TreeNodeId, TreeNode>;
  readonly edges: readonly TreeEdge[];
};
```

With:

```typescript
export type DiagramTree = {
  readonly classes: ReadonlyMap<ClassId, ClassNode>;
  readonly styleDefs: ReadonlyMap<StyleDefId, StyleDefNode>;
  readonly namespaces: ReadonlyMap<NamespaceId, NamespaceNode>;
  readonly relationships: readonly RelationshipEdge[];
  readonly appliesStyleEdges: readonly AppliesStyleEdge[];
  readonly inNamespaceEdges: readonly InNamespaceEdge[];
};
```

Keep the `TreeNode` and `TreeEdge` unions and `TreeNodeId` — they remain useful as
conceptual vocabulary and as builder return types for the namespace recursion case
(a single traversal step can produce either a node or nothing). But `DiagramTree`
itself no longer stores them as unions.

Update the doc comment above `DiagramTree` to describe the six containers instead
of the keyed-by-id Map description.

## Step 2 — Update diagramTreeBuilders.ts

### buildSpatiallyUnawareDiagramTree

Change the accumulator from `{ nodes: Map<TreeNodeId, TreeNode>, edges: TreeEdge[] }`
to the six-container shape matching `DiagramTree`. Update `traverseTokens` to push
into the correct container based on the builder's return type:

- `buildClassNode` result → `classes.set(node.id, node)`
- `buildStyleDefNode` result → `styleDefs.set(node.id, node)`
- `buildNamespaceNode` result → `namespaces.set(node.id, node)`
- `buildRelationshipEdge` result → `relationships.push(edge)`
- `buildAppliesStyleEdge` result → `appliesStyleEdges.push(edge)`
- `buildInNamespaceEdges` result → `inNamespaceEdges.push(...edges)`

Return type becomes `DiagramTree` directly (all six containers, classes have no
spatial yet).

### attachSpatial

Update to operate on `tree.classes` instead of `tree.nodes`:

```typescript
export function attachSpatial(tree: DiagramTree, valid: readonly SpatialEntry[]): DiagramTree {
  const spatialByClassId = new Map(valid.map((entry) => [entry.classId, entry.spatial]));
  const classes = new Map(tree.classes);

  for (const [id, node] of classes) {
    const spatial = spatialByClassId.get(node.id);
    if (spatial) {
      classes.set(id, { ...node, spatial });
    }
  }

  return { ...tree, classes };
}
```

### NEW: synthesizeImplicitClassNodes

Add a new exported function:

```typescript
/**
 * Synthesizes minimal ClassNode entries for relationship endpoints that have
 * no explicit class declaration in source. Mermaid allows referencing a class
 * only via a relationship (e.g. "Animal <|-- Duck" with neither class declared).
 * Synthesized nodes have location: null and no spatial — they fall into
 * missingIds and are placed on canvas via the existing Generate flow.
 */
export function synthesizeImplicitClassNodes(tree: DiagramTree): DiagramTree {
  const classes = new Map(tree.classes);

  for (const relationship of tree.relationships) {
    for (const id of [relationship.source, relationship.target]) {
      if (!classes.has(id)) {
        classes.set(id, {
          kind: "class",
          id,
          members: [],
          location: null,
        });
      }
    }
  }

  return { ...tree, classes };
}
```

## Step 3 — Update index.ts (parseDiagram)

New pipeline order — synthesis must happen before spatial attachment so synthesized
classes are correctly detected as missing spatial:

```typescript
const tokens = tokenize(source);
const spatiallyUnawareTree = buildSpatiallyUnawareDiagramTree(tokens);
const treeWithImplicitClasses = synthesizeImplicitClassNodes(spatiallyUnawareTree);
const { valid, malformed } = parseSpatialAnnotations(tokens);
const model = attachSpatial(treeWithImplicitClasses, valid);

const missingIds = [...model.classes.values()]
  .filter((node) => !node.spatial)
  .map((node) => node.id);
```

Update imports: add `synthesizeImplicitClassNodes` from `./diagramTreeBuilders`.
Remove the `ClassNode` type-guard filter — `model.classes.values()` is already
`ClassNode[]`.

## Step 4 — Update EditorMode.tsx

### classBoxes

Replace the iteration over `model.nodes` + `appliesStyle` edge filtering with direct
container access:

```typescript
const classBoxes = useMemo((): ClassBoxProps[] => {
  if (!model) return [];
  const result: ClassBoxProps[] = [];

  for (const node of model.classes.values()) {
    if (!node.spatial) continue;
    const styleEdge = model.appliesStyleEdges.find((edge) => edge.source === node.id);
    const styleDef = styleEdge ? model.styleDefs.get(styleEdge.target) : undefined;
    result.push({ node, styleDef });
  }
  return result;
}, [model]);
```

### relationships

Replace the kind-filter + existence-check with direct access. The existence check
is no longer needed — `synthesizeImplicitClassNodes` guarantees every relationship
endpoint exists in `model.classes`. The spatial check remains as a defensive guard:

```typescript
const relationships = useMemo((): RelationshipEdge[] => {
  if (!model) return [];
  return model.relationships.filter((relationship) => {
    const source = model.classes.get(relationship.source);
    const target = model.classes.get(relationship.target);
    return Boolean(source?.spatial) && Boolean(target?.spatial);
  });
}, [model]);
```

Remove the now-unused `AppliesStyleEdge` type import if no longer referenced
directly (check — `model.appliesStyleEdges` is typed via `DiagramTree`, the
explicit import may no longer be needed).

## Step 5 — Update Layout.tsx computeGenerateEdits

Replace the `model.nodes` filter with direct `model.classes` access:

```typescript
function computeGenerateEdits(
  model: DiagramTree,
  missingIds: readonly ClassId[],
  malformedAnnotations: ReadonlyMap<ClassId, SourceLocation>,
  sourceText: string
): ApplyEditsMessage["edits"] {
  let maxBottom = 0;
  const existingSpatial = [...model.classes.values()].flatMap((node) =>
    node.spatial ? [node.spatial] : []
  );
  // ... rest unchanged
}
```

Remove the now-unused `ClassNode` type import if no longer referenced.

## Step 6 — Check other consumers

Search for any other usages of `.nodes` / `.edges` on a `DiagramTree` value
(e.g. `model.nodes.get(...)`, `model.edges.filter(...)`) across
`webview/src/components/` and update to the new container names. Also check
`buildInNamespaceEdges` — it currently returns `InNamespaceEdge[]` (plural) from
a single namespace token; confirm this still fits the new
`traverseTokens` → `inNamespaceEdges.push(...edges)` pattern.

## Verification

```
npm run check
```

No type errors. No `@ts-ignore`. Report result.
