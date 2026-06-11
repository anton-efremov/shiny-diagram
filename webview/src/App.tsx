import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { Mode } from "./types";
import Layout from "./components/Layout/Layout";
import { readInitialData } from "./utils/initialData";

/** Root application component. Owns mode state and delegates all rendering to Layout. */
export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");

  const initialData = useMemo(() => readInitialData(), []);
  const { fileName, firstLine, lineCount, characterCount, sourceText } = initialData;

  return (
    <Layout
      mode={mode}
      setMode={setMode}
      fileName={fileName}
      firstLine={firstLine}
      lineCount={lineCount}
      characterCount={characterCount}
      sourceText={sourceText}
    />
  );
}
