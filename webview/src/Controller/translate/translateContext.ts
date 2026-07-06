/**
 * @fileoverview Transaction-scoped translate context: a per-dispatch ledger of
 * state that spans commands within one frozen snapshot. Methods accumulate what
 * the transaction has claimed so far — never another intent's output, keeping the
 * single-snapshot invariant intact. Source-identity allocation is the first such
 * concern; further cross-command bookkeeping belongs here.
 */

import type { ClassId } from "../../shared/ids";
import type { DiagramGraph } from "../model/diagramGraph";
import { generateDuplicateClassId } from "./generateId";

export type TranslateContext = {
  readonly allocateDuplicateId: (sourceClassId: ClassId) => ClassId;
};

export function createTranslateContext(graph: DiagramGraph): TranslateContext {
  const reserved = new Set<ClassId>();

  return {
    allocateDuplicateId(sourceClassId) {
      const id = generateDuplicateClassId(graph, sourceClassId, reserved);
      reserved.add(id);
      return id;
    },
  };
}
