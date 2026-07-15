/**
 * @fileoverview Translates class header text-block commands.
 */

import type { EditorCommandOf } from "../../../../View/commands";
import { toClassId, type ClassId } from "../../../../shared/ids";
import type { DiagramGraph } from "../../../model/diagramGraph";
import type { ProvenanceIndex } from "../../../model/provenanceIndex";
import { spellIdentity } from "../../../model/identitySpelling";
import { toSourceGenericTypes } from "../../../model/memberText";
import { anchorBlockOpening } from "../../anchors/statementAnchors";
import { rewriteBlocklessClassWithFirstChild } from "../../placement/classBlockEnsure";
import type { TranslateContext } from "../../translateContext";
import type { WriteIntent } from "../../writeIntent";

/**
 * Makes nine groups of writes — the class name is always written; remaining groups only
 * under their stated source conditions:
 *
 * 1. class name **value**
 *    - in place
 * 2. class generic **value**, when the class generic and the new generic are written
 *    - in place
 * 3. class generic **clause** deleted, when the class generic is written and the new generic
 *    is absent
 * 4. class generic **clause**, when the class generic is absent and the new generic is written
 *    - after the class name
 * 5. endpoint **value**, for every relationship endpoint naming the class when the class
 *    name changes
 *    - in place
 * 6. direct style target **value**, when the class name changes and the direct style
 *    statement exists
 *    - in place
 * 7. spatial target **value**, when the class name changes and the spatial annotation
 *    statement exists
 *    - in place
 * 8. style application target **value**, for every style application statement targeting
 *    the class when the class name changes
 *    - in place
 * 9. member owner **value**, for every short member statement owned by the class when the
 *    class name changes
 *    - in place
 */
export function translateClassNameSet(
  command: EditorCommandOf<"class.name.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  context: TranslateContext
): WriteIntent[] {
  const parsed = parseDisplayClassName(command.name);
  const nextClassId = toClassId(parsed.identity);
  const intents: WriteIntent[] = [];

  if (nextClassId !== command.classId) {
    context.recordClassRenamed(command.classId, nextClassId);
    intents.push(...renameClassReferences(command.classId, nextClassId, graph, provenance));
  }

  const genericPayload = parsed.genericType
    ? toSourceGenericTypes(`<${parsed.genericType}>`)
    : null;
  const hasGeneric = provenance.classes.get(command.classId)?.fields.genericType !== undefined;
  intents.unshift({
    kind: "replaceValue",
    target: { kind: "className", classId: command.classId },
    payload: spellIdentity(nextClassId),
  });
  if (hasGeneric && genericPayload !== null) {
    intents.push({
      kind: "replaceValue",
      target: { kind: "classGenericType", classId: command.classId },
      payload: genericPayload,
    });
  } else if (hasGeneric) {
    intents.push({
      kind: "deleteClause",
      target: { kind: "classGeneric", classId: command.classId },
    });
  } else if (genericPayload !== null) {
    const clause = { kind: "classGeneric" as const, classId: command.classId };
    intents.push({
      kind: "insertClause",
      payload: genericPayload,
      anchor: {
        kind: "afterComponent",
        clause,
        component: { kind: "className", classId: command.classId },
      },
    });
  }
  return intents;
}

/**
 * Makes one of three write options:
 *
 * a. class label already written and new label non-null → class label **value**
 *    - in place
 * b. class label absent and new label non-null → class label **clause** (anchored at first match)
 *    - after the class generic
 *    - after the class name
 * c. otherwise → class label **clause** deleted
 *
 * No-op when the class label is absent and the new label is null.
 */
export function translateClassLabelSet(
  command: EditorCommandOf<"class.label.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const record = provenance.classes.get(command.classId);
  if (!record) throw new Error(`Missing provenance for class ${command.classId}`);
  if (!graph.classes.has(command.classId)) throw new Error(`Missing class ${command.classId}`);

  if (command.label === null) {
    if (!record.fields.labelFull) return [];
    return [{ kind: "deleteClause", target: { kind: "classLabel", classId: command.classId } }];
  }

  if (record.fields.label) {
    return [
      {
        kind: "replaceValue",
        target: { kind: "classLabel", classId: command.classId },
        payload: command.label,
      },
    ];
  }

  const clause = { kind: "classLabel" as const, classId: command.classId };
  return [
    {
      kind: "insertClause",
      payload: `["${command.label}"]`,
      anchor: {
        kind: "afterComponent",
        clause,
        component: record.fields.genericType
          ? { kind: "classGenericType", classId: command.classId }
          : { kind: "className", classId: command.classId },
      },
    },
  ];
}

/**
 * Makes one of three write options:
 *
 * a. class annotation already written → class annotation **value**
 *    - in place
 * b. class annotation absent and class body written → class annotation **statement**, in the
 *    **class body**
 *    - at block opening
 * c. otherwise → Makes two writes:
 *    1. old class declaration **statement** deleted
 *    2. new class declaration **statement** carrying the source declaration and a body with
 *       the class annotation statement, at the old location
 *
 * No-op when the class annotation is absent and the new annotation is null.
 */
export function translateClassAnnotationSet(
  command: EditorCommandOf<"class.annotation.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  sourceText: string
): WriteIntent[] {
  const record = provenance.classes.get(command.classId);
  if (!record) throw new Error(`Missing provenance for class ${command.classId}`);

  if (command.annotation === null) {
    if (!record.fields.annotation) return [];
    return [
      {
        kind: "replaceValue",
        target: { kind: "classAnnotation", classId: command.classId },
        payload: "",
      },
    ];
  }

  const payload = `<<${command.annotation}>>`;
  if (record.fields.annotation) {
    return [
      {
        kind: "replaceValue",
        target: { kind: "classAnnotation", classId: command.classId },
        payload,
      },
    ];
  }
  if (!record.body) {
    return rewriteBlocklessClassWithFirstChild(
      command.classId,
      graph,
      provenance,
      sourceText,
      payload
    );
  }
  return [
    {
      kind: "insertStatement",
      payload,
      anchor: anchorBlockOpening({ kind: "class", classId: command.classId }),
    },
  ];
}

function renameClassReferences(
  from: ClassId,
  to: ClassId,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const payload = spellIdentity(to);
  const intents: WriteIntent[] = [];

  for (const relationship of graph.relationships.values()) {
    if (relationship.source.classId === from) {
      intents.push({
        kind: "replaceValue",
        target: { kind: "relationshipEndpoint", relationshipId: relationship.id, side: "source" },
        payload,
      });
    }
    if (relationship.target.classId === from) {
      intents.push({
        kind: "replaceValue",
        target: { kind: "relationshipEndpoint", relationshipId: relationship.id, side: "target" },
        payload,
      });
    }
  }

  if (provenance.classDirectStyles.has(from)) {
    intents.push({
      kind: "replaceValue",
      target: { kind: "directStyleTarget", classId: from },
      payload,
    });
  }
  if (provenance.classSpatial.has(from)) {
    intents.push({
      kind: "replaceValue",
      target: { kind: "spatialTarget", target: { kind: "class", classId: from } },
      payload,
    });
  }
  for (const styleApplication of graph.styleApplications.values()) {
    if (styleApplication.targetId === from) {
      intents.push({
        kind: "replaceValue",
        target: { kind: "styleApplicationTarget", styleApplicationId: styleApplication.id },
        payload,
      });
    }
  }
  for (const [memberId] of provenance.shortMembers) {
    if (String(memberId).startsWith(`${from}:`)) {
      intents.push({ kind: "replaceValue", target: { kind: "memberOwner", memberId }, payload });
    }
  }

  return intents;
}

function parseDisplayClassName(displayName: string): {
  readonly identity: string;
  readonly genericType: string | null;
} {
  const trimmed = displayName.trim();
  const genericStart = trimmed.indexOf("<");
  if (genericStart === -1 || !trimmed.endsWith(">")) {
    return { identity: trimmed, genericType: null };
  }
  return {
    identity: trimmed.slice(0, genericStart).trim(),
    genericType: trimmed.slice(genericStart + 1, -1),
  };
}
