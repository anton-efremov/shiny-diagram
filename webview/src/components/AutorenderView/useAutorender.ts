/**
 * @fileoverview Hook encapsulating the Mermaid autorender pipeline: source
 * normalization, one-time Mermaid initialization, and async SVG rendering.
 * No spatial annotation knowledge lives here.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import mermaid from "mermaid";

type UseAutorenderResult = {
  mermaidContainerRef: RefObject<HTMLDivElement | null>;
  renderError: string | null;
};

/**
 * Manages the Mermaid autorender lifecycle for a given source text.
 * Initializes Mermaid once on mount, re-renders whenever the source changes,
 * and pauses rendering when the autorender panel is not the active mode.
 *
 * @param sourceText - Raw Mermaid source from the active document.
 * @param isActive - True when the autorender panel is the current mode.
 * @returns Ref to attach to the SVG host element, and any current render error.
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
    if (!isActive || !mermaidContainerRef.current) {
      return;
    }

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

/**
 * Rewrites hyphenated CSS property names in classDef lines to camelCase so
 * Mermaid's parser accepts them without errors.
 *
 * @param source - Full .mmd file content.
 * @returns Source string with classDef property names normalized.
 */
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
