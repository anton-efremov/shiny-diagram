# Refactor Task — Replace rules/ with diagramTreeBuilder + builders/

## Context

The parser currently runs four separate passes over the token array (parseClasses,
parseRelationships, parseStyles, parseSpatial). This is being replaced with a single
tree traversal that dispatches to small focused builder functions.

The tokenizer has also been updated: `TokenizedLine` is now `ParseToken`, `blockLines`
is now `blockTokens`, and `classDecl` is now `classDeclaration`. These renames must
be applied as part of this task.

## Target structure

```
webview/src/parsers/classDiagram/
  index.ts                        — updated (see below)
  tokenizer.ts                    — already updated (ParseToken, blockTokens, classDeclaration)
  parseResult.ts                  — no changes needed
  diagramTreeBuilder.ts           — NEW: single traversal, dispatches to builders
  builders/
    buildClassNode.ts             — NEW: handles classDeclaration tokens
    buildStyleDefNode.ts          — NEW: handles styleDef tokens
    buildRelationshipEdge.ts      — NEW: handles relationship tokens
    buildAppliesStyleEdge.ts      — NEW: handles styleApplication tokens
    buildSpatialData.ts           — NEW: handles spatialAnnotation tokens
  rules/                          — DELETE entire folder after builders are complete
```

## Step 1 — Apply tokenizer renames throughout rules/ and index.ts

In all files under `rules/` and in `index.ts`:

- `TokenizedLine` → `ParseToken`
- `line.blockLines` → `line.blockTokens`
- `type !== "classDecl"` → `type !== "classDeclaration"`
- `type === "classDecl"` → `type === "classDeclaration"`
- Variables named `lines` holding tokenizer output → `tokens`
- Parameters named `lines: ParseToken[]` → `tokens: ParseToken[]`
- Import path `"../tokenizer"` stays the same, just the type name changes

## Step 2 — Create builders/

Each builder is a pure function that takes a `ParseToken` (and helpers where needed)
and returns a typed result or null. All builders import `ParseToken` from
`"../tokenizer"` and types from `"../../../models/classDiagram/diagramTreeModel"` and
primitives from `"../../../models/classDiagram/primitives"`.

Each builder should also export a `toSourceLocation` helper (or import a shared one —
your choice, but don't duplicate it more than once; consider a shared
`builders/toSourceLocation.ts`).

### `builders/toSourceLocation.ts`

Extract the repeated `toSourceLocation` helper that exists in every rules file:

```typescript
export function toSourceLocation(token: ParseToken): SourceLocation {
  return {
    startLine: token.lineNumber,
    startChar: 0,
    endLine: token.lineNumber,
    endChar: token.raw.length,
    raw: token.raw,
  };
}
```

### `builders/buildClassNode.ts`

Move logic from `parseClasses.ts`. Exports:

```typescript
export function buildClassNode(token: ParseToken): ClassNode | null;
export function buildAppliesStyleEdgesFromToken(token: ParseToken): AppliesStyleEdge[];
```

`buildClassNode` handles `classDeclaration` tokens, reads `token.blockTokens` for
members and annotation. `buildAppliesStyleEdgesFromToken` handles `styleApplication`
tokens.

Wait — style application is a separate token type. Split:

### `builders/buildClassNode.ts`

```typescript
export function buildClassNode(token: ParseToken): ClassNode | null;
// handles classDeclaration tokens only
// reads token.blockTokens for members and annotation
// internal helpers: parseClassBody, parseClassMember, parseFieldMember, parseMethodMember
// all moved verbatim from parseClasses.ts, updated to use ParseToken
```

### `builders/buildAppliesStyleEdge.ts`

```typescript
export function buildAppliesStyleEdge(token: ParseToken): AppliesStyleEdge | null;
// handles styleApplication tokens
// moved from parseClasses.ts second pass
```

### `builders/buildStyleDefNode.ts`

```typescript
export function buildStyleDefNode(token: ParseToken): StyleDefNode | null;
// moved from parseStyles.ts
// internal helper: parseStyleProperties moved verbatim
```

### `builders/buildRelationshipEdge.ts`

```typescript
export function buildRelationshipEdge(token: ParseToken): RelationshipEdge | null;
// moved from parseRelationships.ts
// internal helpers: splitLabel, findOperator, parseEndpoint moved verbatim
// RELATIONSHIP_OPERATORS constant moved verbatim
```

### `builders/buildSpatialData.ts`

```typescript
export type SpatialEntry = { readonly classId: ClassId; readonly spatial: SpatialData };
export type MalformedAnnotation = { readonly classId: ClassId; readonly location: SourceLocation };
export function buildSpatialData(token: ParseToken): SpatialEntry | MalformedAnnotation | null;
// returns SpatialEntry on success
// returns MalformedAnnotation if classId found but values incomplete
// returns null if token is not a spatialAnnotation
// internal helper: parseSpatialValues moved verbatim
// discriminate return type with a `kind` field or use a separate isMalformed type guard
```

## Step 3 — Create diagramTreeBuilder.ts

Single traversal over the top-level token array. Dispatches to builders.
Recursion into namespace blockTokens is stubbed for Sprint 2.

```typescript
// diagramTreeBuilder.ts

export type DiagramTreeBuildResult = {
  readonly nodes: Map<TreeNodeId, TreeNode>;
  readonly edges: TreeEdge[];
  readonly spatialEntries: SpatialEntry[];
  readonly malformedAnnotations: MalformedAnnotation[];
};

export function buildDiagramTree(tokens: ParseToken[]): DiagramTreeBuildResult {
  const nodes = new Map<TreeNodeId, TreeNode>();
  const edges: TreeEdge[] = [];
  const spatialEntries: SpatialEntry[] = [];
  const malformedAnnotations: MalformedAnnotation[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "classDeclaration": {
        const node = buildClassNode(token);
        if (node) nodes.set(node.id, node);
        break;
      }
      case "styleApplication": {
        const edge = buildAppliesStyleEdge(token);
        if (edge) edges.push(edge);
        break;
      }
      case "styleDef": {
        const node = buildStyleDefNode(token);
        if (node) nodes.set(node.id, node);
        break;
      }
      case "relationship": {
        const edge = buildRelationshipEdge(token);
        if (edge) edges.push(edge);
        break;
      }
      case "spatialAnnotation": {
        const result = buildSpatialData(token);
        if (result) {
          if ("spatial" in result) spatialEntries.push(result);
          else malformedAnnotations.push(result);
        }
        break;
      }
      case "namespace": {
        // Sprint 2: recurse into token.blockTokens to build NamespaceNode
        // and InNamespaceEdges. Stubbed for now.
        break;
      }
    }
    // Also check blockTokens for spatialAnnotations placed inside class bodies
    // (legacy placement by earlier Generate runs).
    if (token.blockTokens) {
      for (const child of token.blockTokens) {
        if (child.type === "spatialAnnotation") {
          const result = buildSpatialData(child);
          if (result) {
            if ("spatial" in result) spatialEntries.push(result);
            else malformedAnnotations.push(result);
          }
        }
      }
    }
  }

  return { nodes, edges, spatialEntries, malformedAnnotations };
}
```

## Step 4 — Update index.ts

Replace the four separate parse calls with a single `buildDiagramTree` call:

```typescript
const tokens = tokenize(source);
const { nodes, edges, spatialEntries, malformedAnnotations } = buildDiagramTree(tokens);

// Attach spatial data to class nodes
const spatialByClassId = new Map(spatialEntries.map((e) => [e.classId, e.spatial]));
for (const [id, node] of nodes) {
  if (node.kind === "class") {
    const spatial = spatialByClassId.get(node.id);
    if (spatial) nodes.set(id, { ...node, spatial });
  }
}

const model: DiagramTree = { nodes, edges };
// ... rest of missingIds / ParseResult logic unchanged
```

Remove imports of parseClasses, parseRelationships, parseStyles, parseSpatial.
Add import of buildDiagramTree from `"./diagramTreeBuilder"`.
Rename `lines` variable to `tokens`.

## Step 5 — Delete rules/ folder

After all builders are complete and `npm run check` passes, delete:

```
webview/src/parsers/classDiagram/rules/
```

## Verification

```
npm run check
```

No type errors. No `@ts-ignore`. Report result.
