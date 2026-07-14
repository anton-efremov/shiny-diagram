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
import { insertFirstClassBlockChildIntoBlocklessClass } from "../../placement/classBlockEnsure";
import type { TranslateContext } from "../../translateContext";
import type { WriteIntent } from "../../writeIntent";

export function translateClassNameSet(
  command: EditorCommandOf<"class.name.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex,
  context: TranslateContext
): WriteIntent[] {
  const parsed = parseDisplayClassName(command.name);
  const nextClassId = toClassId(parsed.identity);
  const current = graph.classes.get(command.classId);
  const currentGeneric = current?.genericType ?? null;
  const intents: WriteIntent[] = [];

  if (nextClassId !== command.classId) {
    context.recordClassRenamed(command.classId, nextClassId);
    intents.push(...renameClassReferences(command.classId, nextClassId, graph, provenance));
  }

  const genericPayload = parsed.genericType ? toSourceGenericTypes(`<${parsed.genericType}>`) : "";
  const hasGeneric = provenance.classes.get(command.classId)?.fields.genericType !== undefined;
  if (hasGeneric) {
    intents.push({
      kind: "replaceValue",
      target: { kind: "classGenericType", classId: command.classId },
      payload: genericPayload,
    });
    intents.unshift({
      kind: "replaceValue",
      target: { kind: "className", classId: command.classId },
      payload: spellIdentity(nextClassId),
    });
    return intents;
  }

  intents.unshift({
    kind: "replaceValue",
    target: { kind: "className", classId: command.classId },
    payload: `${spellIdentity(nextClassId)}${currentGeneric === null ? genericPayload : ""}`,
  });
  return intents;
}

export function translateClassLabelSet(
  command: EditorCommandOf<"class.label.set">,
  graph: DiagramGraph,
  provenance: ProvenanceIndex
): WriteIntent[] {
  const record = provenance.classes.get(command.classId);
  if (!record) throw new Error(`Missing provenance for class ${command.classId}`);
  const node = graph.classes.get(command.classId);
  if (!node) throw new Error(`Missing class ${command.classId}`);

  if (command.label === null) {
    if (!record.fields.labelFull) return [];
    return [
      {
        kind: "replaceValue",
        target: { kind: "classLabelFull", classId: command.classId },
        payload: "",
      },
    ];
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

  const labelPayload = `["${command.label}"]`;
  if (record.fields.genericType) {
    return [
      {
        kind: "replaceValue",
        target: { kind: "classGenericType", classId: command.classId },
        payload: `${toSourceGenericTypes(`<${node.genericType ?? ""}>`)}${labelPayload}`,
      },
    ];
  }

  return [
    {
      kind: "replaceValue",
      target: { kind: "className", classId: command.classId },
      payload: `${spellIdentity(command.classId)}${labelPayload}`,
    },
  ];
}

/**
 * Makes one of five write options:
 *
 * a. class annotation already written → class annotation **value**
 *    - in place
 * b. class annotation absent and class body written → class annotation **statement**, in the
 *    **class body**
 *    - at block opening
 * c. no class body and class label written → class label **value**, carrying the original
 *    value and a new class body with the class annotation statement
 *    - in place
 * d. no class body, no class label, and class generic written → class generic **value**,
 *    carrying the original value and a new class body with the class annotation statement
 *    - in place
 * e. otherwise → class name **value**, carrying the original value and a new class body with
 *    the class annotation statement
 *    - in place
 *
 * No-op when the class annotation is absent and the new annotation is null.
 */
export function translateClassAnnotationSet(
  command: EditorCommandOf<"class.annotation.set">,
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
    return insertFirstClassBlockChildIntoBlocklessClass(
      command.classId,
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
