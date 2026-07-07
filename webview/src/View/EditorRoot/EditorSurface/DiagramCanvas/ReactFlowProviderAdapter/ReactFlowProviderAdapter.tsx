/**
 * @framework Mounts the React Flow store provider for the canvas subtree.
 */

import type { ReactElement, ReactNode } from "react";
import { ReactFlowProvider } from "@xyflow/react";

type ReactFlowProviderAdapterProps = {
  readonly children: ReactNode;
};

export default function ReactFlowProviderAdapter({
  children,
}: ReactFlowProviderAdapterProps): ReactElement {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
