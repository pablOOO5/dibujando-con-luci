import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

// Galeria de dibujos terminados, guardados como PNG (Blob) en IndexedDB.
export interface Drawing {
  id: string
  animalId: string
  animalName: string
  blob: Blob
  createdAt: number
}

interface LuciDB extends DBSchema {
  dibujos: { key: string; value: Drawing; indexes: { 'by-date': number } }
}

let dbp: Promise<IDBPDatabase<LuciDB>> | null = null
function db() {
  if (!dbp) {
    dbp = openDB<LuciDB>('luci-galeria', 1, {
      upgrade(d) {
        const store = d.createObjectStore('dibujos', { keyPath: 'id' })
        store.createIndex('by-date', 'createdAt')
      },
    })
  }
  return dbp
}

export async function saveDrawing(animalId: string, animalName: string, blob: Blob): Promise<void> {
  const d = await db()
  const createdAt = Date.now()
  await d.put('dibujos', { id: `${animalId}-${createdAt}`, animalId, animalName, blob, createdAt })
}

export async function listDrawings(): Promise<Drawing[]> {
  const d = await db()
  const all = await d.getAll('dibujos')
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteDrawing(id: string): Promise<void> {
  const d = await db()
  await d.delete('dibujos', id)
}
