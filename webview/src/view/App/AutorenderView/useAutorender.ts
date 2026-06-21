/**
 * @fileoverview Hook for rendering Mermaid source into the autorender canvas.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import mermaid from "mermaid";

type UseAutorenderResult = {
  mermaidContainerRef: RefObject<HTMLDivElement | null>;
  renderError: string | null;
};

/**
 * Renders Mermaid source into a DOM container while the autorender view is active.
 */
export function useAutorender(sourceText: string, isActive: boolean): UseAutorenderResult {
  const [renderError, setRenderError] = useState<string | null>(null);
  const mermaidContainerRef = useRef<HTMLDivElement | null>(null);
  const renderIdRef = useRef(`shiny-source-diagram-${Math.random().toString(36).slice(2)}`);
  const renderableSourceText = useMemo(
    () => normalizeClassDefStyleProperties(sourceText),
    [sourceText]
  );

  useEffect(() => {
    const theme = readMermaidThemeVariables();
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      htmlLabels: false,
      theme: "base",
      themeVariables: theme,
    });
  }, []);

  useEffect(() => {
    if (!isActive || !mermaidContainerRef.current) return;

    let disposed = false;

    async function renderDiagram(): Promise<void> {
      try {
        if (!renderableSourceText.trim()) {
          throw new Error("No Mermaid source text was available from the active document.");
        }
        const { svg } = await mermaid.render(renderIdRef.current, renderableSourceText);
        if (!disposed && mermaidContainerRef.current) {
          mermaidContainerRef.current.innerHTML = svg;
          setRenderError(null);
        }
      } catch (error) {
        if (!disposed) {
          setRenderError(error instanceof Error ? error.message : "Mermaid render failed.");
        }
      }
    }

    void renderDiagram();
    return () => {
      disposed = true;
    };
  }, [isActive, renderableSourceText]);

  return { mermaidContainerRef, renderError };
}

function readShinyToken(tokenName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
}

function readMermaidThemeVariables(): Record<string, string> {
  return {
    primaryColor: readShinyToken("--shiny-surface"),
    primaryBorderColor: readShinyToken("--shiny-border"),
    primaryTextColor: readShinyToken("--shiny-text"),
    lineColor: readShinyToken("--shiny-text-muted"),
    textColor: readShinyToken("--shiny-text"),
    fontFamily: readShinyToken("--shiny-font-family"),
  };
}

function normalizeClassDefStyleProperties(source: string): string {
  return source.replace(
    /^(\s*classDef\s+\S+\s+)(.*)$/gm,
    (_line, prefix: string, styleProps: string) => {
      const normalized = styleProps
        .replace(/\bstroke-width:/g, "strokeWidth:")
        .replace(/\bstroke-dasharray:/g, "strokeDasharray:");
      return `${prefix}${normalized}`;
    }
  );
}
