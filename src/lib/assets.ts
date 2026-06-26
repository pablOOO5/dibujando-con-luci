// Resuelve rutas de assets respetando el base path (sirve si se publica en un subdirectorio,
// p.ej. GitHub Pages). El manifest guarda rutas con "/" inicial; aca las normalizamos.
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
