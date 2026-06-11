import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { Mode } from "./types";
import type { HostMessage } from "./protocol";
import Layout from "./components/Layout/Layout";
import { readInitialData } from "./utils/initialData";

/** Root application component. Owns mode and live source state. */
export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");

  const initialData = useMemo(() => readInitialData(), []);
  const [sourceText, setSourceText] = useState(initialData.sourceText);

  useEffect(() => {
    function handleMessage(event: MessageEvent<HostMessage>): void {
      const msg = event.data;
      if (msg.type === "sourceUpdate") {
        setSourceText(msg.sourceText);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Layout
      mode={mode}
      setMode={setMode}
      fileName={initialData.fileName}
      firstLine={initialData.firstLine}
      lineCount={initialData.lineCount}
      characterCount={initialData.characterCount}
      sourceText={sourceText}
    />
  );
}
