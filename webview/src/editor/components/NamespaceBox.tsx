import type { ReactElement } from "react";
import type { NamespaceBoxView } from "../../domain/classDiagram/derive/viewModel";

type NamespaceBoxProps = { view: NamespaceBoxView };

// Stub — namespace visual rendering is not yet implemented.
export default function NamespaceBox(_props: NamespaceBoxProps): ReactElement {
  return <></>;
}
