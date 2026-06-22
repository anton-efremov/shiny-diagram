/**
 * @fileoverview Internal context and result contracts shared by command handlers.
 */

import type { DiagramTree } from "../model/diagramTree";
import type { SourceLocation } from "../model/sourceLocation";
import type { ClassId } from "../../shared/ids";
import type { SourceEdit } from "./sourceEdit";

export type CommandContext = {
  readonly sourceText: string;
  readonly model: DiagramTree;
  readonly malformedAnnotations?: ReadonlyMap<ClassId, SourceLocation>;
};

export type CommandResult =
  | {
      readonly ok: true;
      readonly edits: SourceEdit[];
      readonly createdClassId?: ClassId;
    }
  | {
      readonly ok: false;
      readonly problem: string;
    };
