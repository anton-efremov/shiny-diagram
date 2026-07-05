/**
 * @role [P] Presentational
 * @presents Small decorative Shiny View control icons.
 */

import type { ReactElement, ReactNode } from "react";

type IconProps = {
  readonly className?: string;
};

function IconFrame({ className, children }: IconProps & { children: ReactNode }): ReactElement {
  // @job render:structure
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ClassIcon({ className }: IconProps): ReactElement {
  // @job render:structure
  return (
    <IconFrame className={className}>
      <path
        d="M3.5 3.5h9v9h-9zM3.5 6.5h9M5.25 9h5.5M5.25 11h3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function GenerateIcon({ className }: IconProps): ReactElement {
  // @job render:structure
  return (
    <IconFrame className={className}>
      <path
        d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2M4.25 4.25l1.4 1.4M10.35 10.35l1.4 1.4M11.75 4.25l-1.4 1.4M5.65 10.35l-1.4 1.4M8 5.75 9.1 8 8 10.25 6.9 8z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function DuplicateIcon({ className }: IconProps): ReactElement {
  // @job render:structure
  return (
    <IconFrame className={className}>
      <path
        d="M5 5.5h6.5v7H5zM3.5 10.5h-1v-7H9v1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function DeleteIcon({ className }: IconProps): ReactElement {
  // @job render:structure
  return (
    <IconFrame className={className}>
      <path
        d="M3.5 4.5h9M6.5 2.5h3M5 4.5l.5 8h5l.5-8M7 7v3M9 7v3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function FillIcon({ className }: IconProps): ReactElement {
  // @job render:structure
  return (
    <IconFrame className={className}>
      <path
        d="M4 3.5h5l3 3v6H4zM9 3.5v3h3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.8 9.25h4.4v1.5H5.8z" fill="currentColor" />
    </IconFrame>
  );
}

export function BorderIcon({ className }: IconProps): ReactElement {
  // @job render:structure
  return (
    <IconFrame className={className}>
      <path
        d="M3.5 3.5h9v9h-9z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 5.5h5v5h-5z" stroke="currentColor" strokeWidth="1" strokeDasharray="1 1.6" />
    </IconFrame>
  );
}

export function TextColorIcon({ className }: IconProps): ReactElement {
  // @job render:structure
  return (
    <IconFrame className={className}>
      <path
        d="M4 12.5 7.4 3.5h1.2l3.4 9M5.2 9.5h5.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.5 13.5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </IconFrame>
  );
}
