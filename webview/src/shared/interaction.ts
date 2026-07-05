/**
 * @fileoverview Class interaction attachment vocabulary shared by command and graph contracts.
 */

export type InteractionAttachment = {
  readonly action: "link" | "callback";
  readonly reference: string;
  readonly tooltip: string | null;
};
