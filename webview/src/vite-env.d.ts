/// <reference types="vite/client" />

declare module "*.module.css" {
  const styles: Record<string, string>;
  export default styles;
}

declare module "*.css" {
  const styles: string;
  export default styles;
}

declare module "@xyflow/react/dist/style.css" {
  const styles: string;
  export default styles;
}
