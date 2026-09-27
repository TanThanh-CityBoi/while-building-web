// Consuming apps compile these with Vite; this only lets the package type-check on its own.
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
