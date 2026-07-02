/**
 * @fileoverview Internal context and result contracts shared by command handlers.
 */

import type { DiagramGraph } from "../model/diagramGraph";
import type { ProvenanceIndex } from "../model/provenanceIndexOld";
import type { SourceLocation } from "../model/sourceLocation";
import type { ClassId } from "../../shared/ids";
import type { SourceEdit } from "./sourceEdit";

export type CommandContext = {
  readonly sourceText: string;
  readonly graph: DiagramGraph;
  readonly provenance: ProvenanceIndex;
  readonly malformedAnnotations?: ReadonlyMap<ClassId, SourceLocation>;
};

export type CommandResult =
  | {
      readonly ok: true;
      readonly edits: SourceEdit[];
    }
  | {
      readonly ok: false;
      readonly problem: string;
    };
