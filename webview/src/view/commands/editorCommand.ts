/**
 * @fileoverview Aggregate command language emitted by the View layer.
 */

import type { GenerateCommand } from "../AppHeader/commands";
import type { ClassDiagramCommand } from "../EditorView/ClassDiagram/commands";
import type { StyleCommand } from "../EditorView/StylePane/commands";

export type EditorCommand = GenerateCommand | ClassDiagramCommand | StyleCommand;
