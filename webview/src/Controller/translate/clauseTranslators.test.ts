import { describe, expect, it } from "vitest";
import { toClassId, toRelationshipId } from "../../shared/ids";
import type { DiagramGraph } from "../model/diagramGraph";
import type { ProvenanceIndex } from "../model/provenanceIndex";
import { createTranslateContext } from "./translateContext";
import {
  translateClassLabelSet,
  translateClassNameSet,
} from "./workers/Class/translateClassHeader";
import { translateRelationshipLabelSet } from "./workers/Relationship/translateRelationshipLabelSet";
import { translateRelationshipSourceMultiplicitySet } from "./workers/Relationship/translateRelationshipSourceMultiplicitySet";
import { translateRelationshipTargetMultiplicitySet } from "./workers/Relationship/translateRelationshipTargetMultiplicitySet";

const classId = toClassId("Box");
const relationshipId = toRelationshipId("relationship:0");

describe("clause translators", () => {
  it("births and removes a relationship label as a clause", () => {
    expect(
      translateRelationshipLabelSet(
        { type: "relationship.label.set", relationshipId, label: "owns" },
        graph(null, null, null)
      )[0].kind
    ).toBe("insertClause");
    expect(
      translateRelationshipLabelSet(
        { type: "relationship.label.set", relationshipId, label: null },
        graph(null, null, "owns")
      )[0].kind
    ).toBe("deleteClause");
  });

  it("births and removes source and target multiplicities as clauses", () => {
    expect(
      translateRelationshipSourceMultiplicitySet(
        { type: "relationship.source.multiplicity.set", relationshipId, multiplicity: "1" },
        graph(null, null, null)
      )[0].kind
    ).toBe("insertClause");
    expect(
      translateRelationshipSourceMultiplicitySet(
        { type: "relationship.source.multiplicity.set", relationshipId, multiplicity: null },
        graph("1", null, null)
      )[0].kind
    ).toBe("deleteClause");
    expect(
      translateRelationshipTargetMultiplicitySet(
        { type: "relationship.target.multiplicity.set", relationshipId, multiplicity: "*" },
        graph(null, null, null)
      )[0].kind
    ).toBe("insertClause");
    expect(
      translateRelationshipTargetMultiplicitySet(
        { type: "relationship.target.multiplicity.set", relationshipId, multiplicity: null },
        graph(null, "*", null)
      )[0].kind
    ).toBe("deleteClause");
  });

  it("births a class label after the generic when present and after the name otherwise", () => {
    const generic = translateClassLabelSet(
      { type: "class.label.set", classId, label: "Container" },
      graph(),
      classProvenance(true, false)
    );
    const plain = translateClassLabelSet(
      { type: "class.label.set", classId, label: "Container" },
      graph(),
      classProvenance(false, false)
    );
    expect(generic[0]).toMatchObject({
      kind: "insertClause",
      anchor: { component: { kind: "classGenericType" } },
    });
    expect(plain[0]).toMatchObject({
      kind: "insertClause",
      anchor: { component: { kind: "className" } },
    });
  });

  it("removes a class label as a clause", () => {
    expect(
      translateClassLabelSet(
        { type: "class.label.set", classId, label: null },
        graph(),
        classProvenance(false, true)
      )[0].kind
    ).toBe("deleteClause");
  });

  it("births and clears a generic through class.name.set", () => {
    const model = graph();
    expect(
      translateClassNameSet(
        { type: "class.name.set", classId, name: "Box<T>" },
        model,
        classProvenance(false, false),
        createTranslateContext(model)
      ).some((intent) => intent.kind === "insertClause")
    ).toBe(true);
    expect(
      translateClassNameSet(
        { type: "class.name.set", classId, name: "Box" },
        model,
        classProvenance(true, false),
        createTranslateContext(model)
      ).some((intent) => intent.kind === "deleteClause")
    ).toBe(true);
  });
});

function graph(
  sourceMultiplicity: string | null = null,
  targetMultiplicity: string | null = null,
  label: string | null = null
): DiagramGraph {
  return {
    classes: new Map([
      [
        classId,
        { id: classId, parentNamespaceId: null, genericType: null, attributes: [], methods: [] },
      ],
    ]),
    relationships: new Map([
      [
        relationshipId,
        {
          id: relationshipId,
          source: { classId, endpointKind: "none", multiplicity: sourceMultiplicity },
          target: { classId, endpointKind: "none", multiplicity: targetMultiplicity },
          lineKind: "solid",
          label,
        },
      ],
    ]),
    namespaces: new Map(),
    notes: new Map(),
    styleDefinitions: new Map(),
    styleApplications: new Map(),
    styleOccurrences: [],
    diagram: {
      kind: "classDiagram",
      id: "classDiagram",
      direction: null,
      config: { hideEmptyMembersBox: null, hierarchicalNamespaces: null },
    },
  } as unknown as DiagramGraph;
}

function classProvenance(hasGeneric: boolean, hasLabel: boolean): ProvenanceIndex {
  const at = { start: { line: 1, character: 6 }, end: { line: 1, character: 9 } };
  return {
    classes: new Map([
      [
        classId,
        {
          self: at,
          header: at,
          body: null,
          fields: {
            declaredName: at,
            ...(hasGeneric ? { genericType: at } : {}),
            ...(hasLabel ? { label: at, labelFull: at } : {}),
          },
        },
      ],
    ]),
  } as unknown as ProvenanceIndex;
}
