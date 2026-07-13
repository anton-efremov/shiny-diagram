/**
 * @render Invalid-syntax editor-state interface.
 */

import type { ReactElement } from "react";
import StatusSurfaceFrame from "../../../ui/chrome/templates/StatusSurfaceFrame/StatusSurfaceFrame";

type ErrorSurfaceProps = {
  readonly errors: readonly string[];
};

export default function ErrorSurface({ errors }: ErrorSurfaceProps): ReactElement {
  const statusText = errors.length > 0 ? errors[0] : "Invalid syntax";

  return (
    <StatusSurfaceFrame
      status={<>Invalid Mermaid syntax: {statusText}</>}
      items={errors}
      variant="errorList"
    />
  );
}
