/**
 * @fileoverview Root application component. Owns mode and live source state,
 * and listens for source update messages from the extension host.
 */

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { Mode } from "./types";
import { readInitialData } from "./utils/initialData";
import { isHostMessage } from "./utils/typeGuards";
import Layout from "./components/Layout/Layout";

/** Root application component. Owns mode and live source state. */
export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>("autorender");
  const [sourceText, setSourceText] = useState<string>(readInitialData);

  useEffect(() => {
    function handleMessage(event: MessageEvent<unknown>): void {
      // Defined inside useEffect so it is created once on mount
      if (!isHostMessage(event.data)) return;
      const msg = event.data;
      if (msg.type === "sourceUpdate") {
        setSourceText(msg.sourceText);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return <Layout mode={mode} setMode={setMode} sourceText={sourceText} />;
}
