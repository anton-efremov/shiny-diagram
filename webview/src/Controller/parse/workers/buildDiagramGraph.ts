/**
 * @fileoverview Builds the Controller diagram graph and provenance index from parser tokens.
 */

import { toClassId, toDiagramId } from "../../../shared/ids";
import {
  STYLE_PROPERTIES,
  type StyleProperties,
  type StylePropertyName,
} from "../../../shared/style";
import type {
  ClassNode,
  DiagramGraph,
  NamespaceNode,
  RelationshipEdge,
  StyleApplicationEdge,
  StyleDefNode,
} from "../../model/diagramGraph";
import type {
  BlockMemberRecord,
  ClassDirectStyleRecord,
  ClassRecord,
  NamespaceRecord,
  ProvenanceIndex,
  RelationshipRecord,
  ShortMemberRecord,
  SpatialRecord,
  StyleApplicationRecord,
  StyleDefRecord,
  StylePropertyFields,
} from "../../model/provenanceIndex";
import type { SourceSpan } from "../../model/sourceEdit";
import { buildAppliesStyleEdge } from "./builders/buildAppliesStyleEdge";
import { buildClassNode } from "./builders/buildClassNode";
import { buildInNamespaceEdges, type InNamespaceEdge } from "./builders/buildInNamespaceEdge";
import { buildNamespaceNode } from "./builders/buildNamespaceNode";
import { buildRelationshipEdge } from "./builders/buildRelationshipEdge";
import { buildStyleDefNode } from "./builders/buildStyleDefNode";
import type { ParseToken } from "./tokenizer";
import { toHeaderLocation, toLineFieldLocation, toSourceLocation } from "./toSourceLocation";

type MutableGraphBuild = {
  readonly classes: Map<ClassNode["id"], ClassNode>;
  readonly styleDefinitions: Map<StyleDefNode["id"], StyleDefNode>;
  readonly namespaces: Map<NamespaceNode["id"], NamespaceNode>;
  readonly relationships: Map<RelationshipEdge["id"], RelationshipEdge>;
  readonly styleApplications: Map<StyleApplicationEdge["id"], StyleApplicationEdge>;
  readonly inNamespaceEdges: InNamespaceEdge[];
  readonly directStyleProperties: Map<ClassNode["id"], StyleProperties>;
  readonly provenance: {
    readonly classes: Map<ClassNode["id"], ClassRecord>;
    readonly blockMembers: Map<
      ClassNode["attributes"][number]["id"] | ClassNode["methods"][number]["id"],
      BlockMemberRecord
    >;
    readonly shortMembers: Map<
      ClassNode["attributes"][number]["id"] | ClassNode["methods"][number]["id"],
      ShortMemberRecord
    >;
    readonly namespaces: Map<NamespaceNode["id"], NamespaceRecord>;
    readonly styleDefinitions: Map<StyleDefNode["id"], StyleDefRecord>;
    readonly relationships: Map<RelationshipEdge["id"], RelationshipRecord>;
    readonly classDirectStyles: Map<ClassNode["id"], ClassDirectStyleRecord>;
    readonly classSpatial: Map<ClassNode["id"], SpatialRecord>;
    readonly namespaceMemberships: Map<ClassNode["id"], SourceSpan>;
    readonly styleApplications: Map<StyleApplicationEdge["id"], StyleApplicationRecord>;
  };
};

export type GraphBuildResult = {
  readonly graph: DiagramGraph;
  readonly provenance: ProvenanceIndex;
};

export function buildSpatiallyUnawareDiagramGraph(tokens: ParseToken[]): GraphBuildResult {
  const build: MutableGraphBuild = {
    classes: new Map(),
    styleDefinitions: new Map(),
    namespaces: new Map(),
    relationships: new Map(),
    styleApplications: new Map(),
    inNamespaceEdges: [],
    directStyleProperties: new Map(),
    provenance: {
      classes: new Map(),
      blockMembers: new Map(),
      shortMembers: new Map(),
      namespaces: new Map(),
      styleDefinitions: new Map(),
      relationships: new Map(),
      classDirectStyles: new Map(),
      classSpatial: new Map(),
      namespaceMemberships: new Map(),
      styleApplications: new Map(),
    },
  };

  traverseTokens(tokens, build);
  synthesizeImplicitClassNodes(build);
  attachDirectStyles(build);
  attachNamespaceMembership(build);

  return {
    graph: toDiagramGraph(build),
    provenance: toProvenanceIndex(tokens, build),
  };
}

function traverseTokens(tokens: readonly ParseToken[], build: MutableGraphBuild): void {
  for (const token of tokens) {
    switch (token.type) {
      case "classDeclaration": {
        const parsed = buildClassNode(token);
        if (parsed) {
          build.classes.set(parsed.node.id, parsed.node);
          build.provenance.classes.set(parsed.node.id, toClassRecord(token));
          for (const [memberId, location] of parsed.memberLocations) {
            build.provenance.blockMembers.set(memberId, {
              self: location,
              fields: { name: location },
            });
          }
        }
        break;
      }
      case "classDirectStyle": {
        const parsed = parseClassDirectStyle(token);
        if (parsed) {
          build.directStyleProperties.set(parsed.classId, parsed.properties);
          build.provenance.classDirectStyles.set(parsed.classId, parsed.record);
          const existing = build.classes.get(parsed.classId);
          if (existing) {
            build.classes.set(parsed.classId, { ...existing, directStyle: parsed.properties });
          }
        }
        break;
      }
      case "styleApplication": {
        const parsed = buildAppliesStyleEdge(token, build.styleApplications.size);
        if (parsed) {
          build.styleApplications.set(parsed.edge.id, parsed.edge);
          build.provenance.styleApplications.set(parsed.edge.id, toStyleApplicationRecord(token));
        }
        break;
      }
      case "styleDef": {
        const parsed = buildStyleDefNode(token);
        if (parsed) {
          build.styleDefinitions.set(parsed.node.id, parsed.node);
          build.provenance.styleDefinitions.set(parsed.node.id, toStyleDefRecord(token));
        }
        break;
      }
      case "relationship": {
        const parsed = buildRelationshipEdge(token, build.relationships.size);
        if (parsed) {
          build.relationships.set(parsed.edge.id, parsed.edge);
          build.provenance.relationships.set(parsed.edge.id, toRelationshipRecord(token));
        }
        break;
      }
      case "namespace": {
        const parsed = buildNamespaceNode(token);
        if (parsed) {
          build.namespaces.set(parsed.node.id, parsed.node);
          build.provenance.namespaces.set(parsed.node.id, {
            self: parsed.location,
            header: toHeaderLocation(token),
            body: toBodyLocation(token),
            fields: { declaredName: toDeclaredNameLocation(token, "namespace") },
          });
        }
        build.inNamespaceEdges.push(...buildInNamespaceEdges(token));
        break;
      }
    }

    if (token.blockTokens) {
      traverseTokens(token.blockTokens, build);
    }
  }
}

function attachDirectStyles(build: MutableGraphBuild): void {
  for (const [classId, properties] of build.directStyleProperties) {
    const node = build.classes.get(classId);
    if (!node) continue;
    build.classes.set(classId, {
      ...node,
      directStyle: properties,
    });
  }
}

function synthesizeImplicitClassNodes(build: MutableGraphBuild): void {
  for (const relationship of build.relationships.values()) {
    for (const id of [relationship.source.classId, relationship.target.classId]) {
      if (!build.classes.has(id)) {
        build.classes.set(id, toImplicitClassNode(id));
      }
    }
  }
  for (const [classId] of build.provenance.classDirectStyles) {
    if (!build.classes.has(classId)) {
      build.classes.set(classId, toImplicitClassNode(classId));
    }
  }
  for (const styleApplication of build.styleApplications.values()) {
    if (!build.classes.has(styleApplication.targetId)) {
      build.classes.set(styleApplication.targetId, toImplicitClassNode(styleApplication.targetId));
    }
  }
}

function attachNamespaceMembership(build: MutableGraphBuild): void {
  for (const edge of build.inNamespaceEdges) {
    const node = build.classes.get(edge.source);
    if (!node) continue;
    build.classes.set(edge.source, { ...node, parentNamespaceId: edge.target });
    build.provenance.namespaceMemberships.set(edge.source, edge.location);
  }
}

function toImplicitClassNode(id: ClassNode["id"]): ClassNode {
  return {
    kind: "class",
    id,
    name: id,
    label: id,
    genericType: null,
    annotation: null,
    parentNamespaceId: null,
    spatial: null,
    attributes: [],
    methods: [],
    lollipopInterfaces: [],
    directStyle: null,
    interaction: null,
  };
}

function toDiagramGraph(build: MutableGraphBuild): DiagramGraph {
  return {
    diagram: {
      kind: "classDiagram",
      id: toDiagramId("classDiagram"),
      direction: null,
      config: {
        hideEmptyMembersBox: null,
        hierarchicalNamespaces: null,
      },
    },
    classes: build.classes,
    namespaces: build.namespaces,
    relationships: build.relationships,
    notes: new Map(),
    styleDefinitions: build.styleDefinitions,
    styleApplications: build.styleApplications,
  };
}

function toProvenanceIndex(
  tokens: readonly ParseToken[],
  build: MutableGraphBuild
): ProvenanceIndex {
  return {
    diagram: toDiagramRecord(tokens),
    classes: build.provenance.classes,
    namespaces: build.provenance.namespaces,
    blockMembers: build.provenance.blockMembers,
    shortMembers: build.provenance.shortMembers,
    relationships: build.provenance.relationships,
    classDirectStyles: build.provenance.classDirectStyles,
    styleDefinitions: build.provenance.styleDefinitions,
    styleApplications: build.provenance.styleApplications,
    classSpatial: build.provenance.classSpatial,
    namespaceSpatial: new Map(),
    notes: new Map(),
  };
}

export function toDiagramRecord(tokens: readonly ParseToken[]): ProvenanceIndex["diagram"] {
  const headerToken = tokens.find((token) => token.raw.trim().startsWith("classDiagram"));
  if (!headerToken) {
    const empty = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
    return { self: empty, header: empty, body: empty };
  }
  const last = tokens.at(-1) ?? headerToken;
  return {
    self: {
      start: { line: headerToken.lineNumber, character: 0 },
      end: {
        line: last.endLine,
        character:
          last.endLine === last.lineNumber
            ? last.raw.length
            : (last.fullRaw.split("\n").at(-1)?.length ?? 0),
      },
    },
    header: toHeaderLocation(headerToken),
    body: {
      start: { line: headerToken.lineNumber + 1, character: 0 },
      end: {
        line: last.endLine,
        character:
          last.endLine === last.lineNumber
            ? last.raw.length
            : (last.fullRaw.split("\n").at(-1)?.length ?? 0),
      },
    },
  };
}

function toClassRecord(token: ParseToken): ClassRecord {
  const isBlock = token.raw.includes("{");
  return {
    self: toSourceLocation(token),
    header: toHeaderLocation(token),
    body: isBlock ? toBodyLocation(token) : null,
    fields: { declaredName: toDeclaredNameLocation(token, "class") },
  };
}

function toDeclaredNameLocation(token: ParseToken, keyword: "class" | "namespace"): SourceSpan {
  const match = new RegExp(`^(\\s*${keyword}\\s+)(\\w+)`).exec(token.raw);
  if (!match) return toHeaderLocation(token);
  const start = match[1].length;
  return toLineFieldLocation(token, start, start + match[2].length);
}

function toBodyLocation(token: ParseToken): SourceSpan {
  if (!token.raw.includes("{")) return toSourceLocation(token);
  return {
    start: { line: token.lineNumber + 1, character: 0 },
    end: { line: Math.max(token.lineNumber + 1, token.endLine - 1), character: 0 },
  };
}

function parseClassDirectStyle(token: ParseToken): {
  readonly classId: ClassNode["id"];
  readonly properties: StyleProperties;
  readonly record: ClassDirectStyleRecord;
} | null {
  const match = /^(\s*style\s+)(\w+)(\s+)(.+)$/.exec(token.raw);
  if (!match) return null;

  const classId = toClassId(match[2]);
  const listStart = match[1].length + match[2].length + match[3].length;
  const propertyList = token.raw.slice(listStart);
  const properties = parseStyleProperties(propertyList);
  return {
    classId,
    properties,
    record: {
      self: toSourceLocation(token),
      fields: {
        target: toLineFieldLocation(token, match[1].length, match[1].length + match[2].length),
        propertyList: toLineFieldLocation(token, listStart, token.raw.length),
        properties: toStylePropertyFields(token, listStart, propertyList),
      },
    },
  };
}

function toStyleDefRecord(token: ParseToken): StyleDefRecord {
  const match = /^(\s*classDef\s+)(\w+)(\s+)(.+)$/.exec(token.raw);
  if (!match) {
    return {
      self: toSourceLocation(token),
      fields: {
        declaredName: toHeaderLocation(token),
        propertyList: toHeaderLocation(token),
        properties: {},
      },
    };
  }

  const listStart = match[1].length + match[2].length + match[3].length;
  return {
    self: toSourceLocation(token),
    fields: {
      declaredName: toLineFieldLocation(token, match[1].length, match[1].length + match[2].length),
      propertyList: toLineFieldLocation(token, listStart, token.raw.length),
      properties: toStylePropertyFields(token, listStart, token.raw.slice(listStart)),
    },
  };
}

function toStyleApplicationRecord(token: ParseToken): StyleApplicationRecord {
  const match = /^(\s*class\s+)(\w+)(:::)(\w+)/.exec(token.raw);
  if (!match) {
    return {
      self: toSourceLocation(token),
      fields: { target: toHeaderLocation(token), styleName: toHeaderLocation(token) },
    };
  }
  const targetStart = match[1].length;
  const styleStart = targetStart + match[2].length + match[3].length;
  return {
    self: toSourceLocation(token),
    fields: {
      target: toLineFieldLocation(token, targetStart, targetStart + match[2].length),
      styleName: toLineFieldLocation(token, styleStart, styleStart + match[4].length),
    },
  };
}

function toRelationshipRecord(token: ParseToken): RelationshipRecord {
  const self = toSourceLocation(token);
  const match =
    /^(\s*)(\w+)(?:\s+"([^"]+)")?\s+([<|*o.]?-?-+>?|<\|--\|>|--\(\)|\.\.\|>|\.\.>)\s+(?:"([^"]+)"\s+)?(\w+)(?:\s*:\s*(.+))?/.exec(
      token.raw
    );
  if (!match) {
    return {
      self,
      fields: { sourceEndpoint: self, operator: self, targetEndpoint: self },
    };
  }
  const sourceStart = match[1].length;
  const operatorStart = token.raw.indexOf(match[4], sourceStart + match[2].length);
  const targetStart = token.raw.indexOf(match[6], operatorStart + match[4].length);
  const labelStart = match[7] ? token.raw.indexOf(match[7], targetStart + match[6].length) : -1;
  return {
    self,
    fields: {
      sourceEndpoint: toLineFieldLocation(token, sourceStart, sourceStart + match[2].length),
      operator: toLineFieldLocation(token, operatorStart, operatorStart + match[4].length),
      targetEndpoint: toLineFieldLocation(token, targetStart, targetStart + match[6].length),
      ...(labelStart >= 0
        ? { label: toLineFieldLocation(token, labelStart, labelStart + (match[7]?.length ?? 0)) }
        : {}),
    },
  };
}

function toStylePropertyFields(
  token: ParseToken,
  listStart: number,
  propertyList: string
): StylePropertyFields {
  const fields: Partial<
    Record<StylePropertyName, { entry: SourceSpan; value: SourceSpan }>
  > = {};
  let offset = 0;
  for (const part of propertyList.split(",")) {
    const entryStart = listStart + offset;
    const entryEnd = entryStart + part.length;
    const colon = part.indexOf(":");
    if (colon !== -1) {
      const sourceName = part.slice(0, colon).trim();
      const property = STYLE_PROPERTIES.find(
        (candidate) => candidate.name === sourceName || candidate.source === sourceName
      );
      if (property) {
        const valueLeading = part.slice(colon + 1).match(/^\s*/)?.[0].length ?? 0;
        const valueTrailing = part.slice(colon + 1).match(/\s*$/)?.[0].length ?? 0;
        const valueStart = entryStart + colon + 1 + valueLeading;
        const valueEnd = entryEnd - valueTrailing;
        fields[property.name] = {
          entry: toLineFieldLocation(token, entryStart, entryEnd),
          value: toLineFieldLocation(token, valueStart, valueEnd),
        };
      }
    }
    offset += part.length + 1;
  }
  return fields;
}

function parseStyleProperties(propertiesStr: string): StyleProperties {
  const properties: Record<keyof StyleProperties, string | null> = {
    fill: null,
    stroke: null,
    strokeWidth: null,
    fontSize: null,
  };

  for (const part of propertiesStr.split(",")) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;

    const key = part.slice(0, colonIdx).trim();
    const value = part.slice(colonIdx + 1).trim();

    const property = STYLE_PROPERTIES.find(
      (styleProperty) => styleProperty.name === key || styleProperty.source === key
    );
    if (property) properties[property.name] = value;
  }

  return properties;
}
