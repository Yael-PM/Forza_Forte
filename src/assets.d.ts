/** Declaración para importar modelos GLB como URL de recurso estático. */
declare module '*.glb' {
  const assetUrl: string;
  export default assetUrl;
}
