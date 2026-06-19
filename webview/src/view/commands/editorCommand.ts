/**
 * @fileoverview Aggregate command language emitted by the View layer.
 */

import type { GenerateCommand } from "../App/AppHeader/commands";
import type { ClassDiagramCommand } from "../App/EditorView/ClassDiagram/commands";
import type { StyleCommand } from "../App/EditorView/StylePane/commands";

export type EditorCommand = GenerateCommand | ClassDiagramCommand | StyleCommand;
