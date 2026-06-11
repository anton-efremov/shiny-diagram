import { useMemo } from "react";
import type { CSSProperties, ReactElement } from "react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { SpatialBox } from "../types";

type EditorViewProps = {
  sourceText: string;
};

type ClassNodeData = {
  label: string;
};

export default function EditorView({ sourceText }: EditorViewProps): ReactElement {
  const boxes = useMemo(() => extractSpatialBoxes(sourceText), [sourceText]);
  const nodes = useMemo(() => toReactFlowNodes(boxes), [boxes]);

  return (
    <section style={styles.editorShell} aria-label="Static editor boxes">
      {nodes.length === 0 ? (
        <p style={styles.emptyState}>No spatial annotations found.</p>
      ) : (
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={{ classBox: ClassBoxNode }}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag
            zoomOnScroll
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </ReactFlowProvider>
      )}
    </section>
  );
}

function ClassBoxNode({ data }: { data: ClassNodeData }): ReactElement {
  return (
    <div style={styles.classBox}>
      <div style={styles.className}>{data.label}</div>
    </div>
  );
}

function extractSpatialBoxes(source: string): SpatialBox[] {
  const classNames = extractClassNames(source);
  const spatialByClassName = extractSpatialAnnotations(source);

  return classNames.flatMap((className) => {
    const spatial = spatialByClassName.get(className);

    if (!spatial) {
      return [];
    }

    return [
      {
        className,
        ...spatial
      }
    ];
  });
}

function extractClassNames(source: string): string[] {
  const names = new Set<string>();
  const classBlockPattern = /^\s*class\s+([A-Za-z_][\w]*)\s*(?:\{|$)/gm;
  let match: RegExpExecArray | null;

  while ((match = classBlockPattern.exec(source)) !== null) {
    names.add(match[1]);
  }

  return [...names];
}

function extractSpatialAnnotations(source: string): Map<string, Omit<SpatialBox, "className">> {
  const spatialByClassName = new Map<string, Omit<SpatialBox, "className">>();
  const annotationPattern = /^\s*%%\s+@spatial:([A-Za-z_][\w]*)\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = annotationPattern.exec(source)) !== null) {
    const values = parseSpatialValues(match[2]);

    if (values) {
      spatialByClassName.set(match[1], values);
    }
  }

  return spatialByClassName;
}

function parseSpatialValues(valueText: string): Omit<SpatialBox, "className"> | null {
  const values = new Map<string, number>();

  for (const part of valueText.trim().split(/\s+/)) {
    const [key, rawValue] = part.split("=");
    const value = Number(rawValue);

    if (key && Number.isFinite(value)) {
      values.set(key, value);
    }
  }

  const x = values.get("x");
  const y = values.get("y");
  const width = values.get("w");
  const height = values.get("h");

  if (x === undefined || y === undefined || width === undefined || height === undefined) {
    return null;
  }

  return { x, y, width, height };
}

function toReactFlowNodes(boxes: SpatialBox[]): Array<Node<ClassNodeData, "classBox">> {
  return boxes.map((box) => ({
    id: box.className,
    type: "classBox",
    position: { x: box.x, y: box.y },
    data: { label: box.className },
    width: box.width,
    height: box.height,
    style: {
      width: box.width,
      height: box.height
    },
    draggable: false,
    selectable: false
  }));
}

const styles = {
  editorShell: {
    height: "620px",
    border: "1px solid var(--vscode-panel-border)",
    background: "var(--vscode-editorWidget-background)",
    overflow: "hidden"
  },
  emptyState: {
    margin: 0,
    padding: "20px",
    color: "var(--vscode-descriptionForeground)"
  },
  classBox: {
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    border: "1px solid #64748b",
    background: "#f8fafc",
    color: "#111827",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "10px",
    fontFamily: "Arial, sans-serif",
    fontSize: "13px"
  },
  className: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%"
  }
} satisfies Record<string, CSSProperties>;
