/**
 * Webview-level diagram identity contracts.
 *
 * IDs in this file cross architectural boundaries so they belong to shared webview layer:
 * - parse creates them from source
 * - deriveViews carries them into render models
 * - view uses them for selection, events, and React keys where appropriate
 * - commands use them as command targets
 *
 * Do not put transient UI IDs here. If an ID exists only for ReactFlow,
 * DOM rendering, or one component's local state, define it near that owner.
 */

export type ClassId = string & { readonly __brand: "ClassId" };
export type StyleDefId = string & { readonly __brand: "StyleDefId" };
export type NamespaceId = string & { readonly __brand: "NamespaceId" };
export type NoteId = string & { readonly __brand: "NoteId" };
