/**
 * @fileoverview Public API for projecting the Controller model into render contracts.
 * Implementation modules remain private to deriveViews.
 */

export { deriveElementViews } from "./deriveElementViews";

export type {
  ClassBoxMemberView,
  ClassBoxView,
  NamespaceBoxView,
  RelationshipView,
  ElementViews,
} from "./viewModels";
