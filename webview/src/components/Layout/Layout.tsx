import { useCallback, useMemo } from "react";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { Mode } from "../../types";
import type { ApplyEditsMessage } from "../../protocol";
import { parseDiagram } from "../../parsers/classDiagram";
import type { ParseResult } from "../../parsers/classDiagram";
import type {
  ClassNode,
  DiagramTree,
  SourceLocation,
} from "../../models/classDiagram/diagramTreeModel";
import type { ClassId } from "../../models/classDiagram/primitives";
import { vscode } from "../../vscodeApi";
import AutorenderMode from "./AutorenderMode/AutorenderMode";
import EditorMode from "./EditorMode/EditorMode";
import styles from "./Layout.module.css";

type LayoutProps = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  sourceText: string;
};

const DEFAULT_W = 200;
const DEFAULT_H = 150;
const MARGIN = 40;

/**
 * Computes LineEdits that generate @spatial annotations for all missing class IDs.
 * Classes with a malformed (incomplete) annotation get a replace edit at that line.
 * Truly absent classes are batched into a single append edit after the last existing
 * annotation (or the last non-empty line), avoiding line-number drift from sequential inserts.
 */
function computeGenerateEdits(
  model: DiagramTree,
  missingIds: readonly ClassId[],
  malformedAnnotations: ReadonlyMap<ClassId, SourceLocation>,
  sourceText: string
): ApplyEditsMessage["edits"] {
  let maxBottom = 0;
  const classNodes = [...model.nodes.values()].filter(
    (node): node is ClassNode => node.kind === "class"
  );
  const existingSpatial = classNodes.flatMap((node) => (node.spatial ? [node.spatial] : []));

  for (const spatial of existingSpatial) {
    const bottom = spatial.y + spatial.height;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  const startY = maxBottom > 0 ? maxBottom + MARGIN : MARGIN;

  const edits: { lineNumber: number; newText: string }[] = [];
  const toAppend: string[] = [];

  missingIds.forEach((classId, idx) => {
    const x = MARGIN + idx * (DEFAULT_W + MARGIN);
    const spatialLine = `%% @spatial:${classId} x=${x} y=${startY} w=${DEFAULT_W} h=${DEFAULT_H}`;
    const malformed = malformedAnnotations.get(classId);
    if (malformed) {
      // Replace the malformed line in-place — no duplicate will be left behind.
      edits.push({ lineNumber: malformed.startLine, newText: spatialLine });
    } else {
      toAppend.push(spatialLine);
    }
  });

  if (toAppend.length > 0) {
    const sourceLines = sourceText.split("\n");
    // Anchor: after the last existing valid @spatial line, or the last non-empty line.
    let anchorLine: number;
    if (existingSpatial.length > 0) {
      anchorLine = Math.max(...existingSpatial.map((spatial) => spatial.location.startLine));
    } else {
      anchorLine = sourceLines.length - 1;
      while (anchorLine > 0 && sourceLines[anchorLine].trim() === "") {
        anchorLine--;
      }
    }
    const anchorRaw = sourceLines[anchorLine] ?? "";
    edits.push({ lineNumber: anchorLine, newText: [anchorRaw, ...toAppend].join("\n") });
  }

  return edits;
}

/**
 * Shell chrome and mode routing. Owns parsing so the ribbon can reflect
 * parse state. Passes the ParseResult to EditorMode; passes raw source to
 * AutorenderMode (which hands it to Mermaid directly).
 */
export default function Layout({ mode, setMode, sourceText }: LayoutProps): ReactElement {
  const parseResult: ParseResult = useMemo(() => parseDiagram(sourceText), [sourceText]);

  const handleGenerate = useCallback(() => {
    if (parseResult.ok || parseResult.error !== "missingAnnotations") return;
    const edits = computeGenerateEdits(
      parseResult.model,
      parseResult.missingIds,
      parseResult.malformedAnnotations,
      sourceText
    );
    if (edits.length === 0) return;
    const message: ApplyEditsMessage = { type: "applyEdits", edits };
    vscode.postMessage(message);
  }, [parseResult, sourceText]);

  const ribbonStatus = (): ReactElement | null => {
    if (mode !== "editor") return null;
    if (parseResult.ok) return null;

    if (parseResult.error === "invalidSyntax") {
      return (
        <span className={styles.statusMessage}>
          ⚠ Invalid Mermaid syntax: {parseResult.message}
        </span>
      );
    }

    if (parseResult.error === "missingAnnotations") {
      return (
        <span className={styles.statusMessage}>
          ⚠ Missing annotations
          <button className={styles.generateButton} type="button" onClick={handleGenerate}>
            Generate
          </button>
        </span>
      );
    }

    return null;
  };

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Shiny Diagram</h1>
        <div className={styles.toolbar} aria-label="Diagram modes">
          <button
            className={mode === "autorender" ? styles.activeButton : styles.button}
            type="button"
            onClick={() => setMode("autorender")}
          >
            Autorender
          </button>
          <button
            className={mode === "editor" ? styles.activeButton : styles.button}
            type="button"
            onClick={() => setMode("editor")}
          >
            Editor
          </button>
          {ribbonStatus()}
        </div>
      </header>

      {mode === "autorender" ? (
        <AutorenderMode sourceText={sourceText} />
      ) : (
        <EditorMode parseResult={parseResult} />
      )}
    </main>
  );
}
