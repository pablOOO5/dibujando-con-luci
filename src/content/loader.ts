import type { Animal, Category, ContentManifest } from '../types'
import { asset } from '../lib/assets'

let cache: Promise<ContentManifest> | null = null

/** Carga (una sola vez) el manifest de contenido. */
export function loadContent(): Promise<ContentManifest> {
  if (!cache) {
    cache = fetch(asset('/content/manifest.json')).then((r) => {
      if (!r.ok) throw new Error('No se pudo cargar el contenido')
      return r.json() as Promise<ContentManifest>
    })
  }
  return cache
}

/** Animales de una categoria, con los favoritos primero. */
export function animalsByCategory(content: ContentManifest, categoryId: string): Animal[] {
  return content.animals
    .filter((a) => a.categoryId === categoryId)
    .sort((a, b) => Number(b.favorite ?? false) - Number(a.favorite ?? false))
}

export function findAnimal(content: ContentManifest, id: string): Animal | undefined {
  return content.animals.find((a) => a.id === id)
}

export function findCategory(content: ContentManifest, id: string): Category | undefined {
  return content.categories.find((c) => c.id === id)
}
