// Modelo de contenido (data-driven). Agregar un animal o categoria = editar
// public/content/manifest.json, sin tocar codigo.

export interface Category {
  id: string
  name: string
  /** Emoji que se muestra como icono de la categoria (sin assets). */
  emoji: string
}

export interface Animal {
  id: string
  name: string
  categoryId: string
  /** Ruta al SVG de line-art (contorno negro, fill none). */
  lineArt: string
  /** Miniatura opcional; por defecto usa el mismo line-art. */
  thumb?: string
  /** Si es true aparece destacado y primero (ej. el koala). */
  favorite?: boolean
}

export interface ContentManifest {
  categories: Category[]
  animals: Animal[]
}
