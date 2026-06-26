import { useEffect, useRef, useState } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { listDrawings, deleteDrawing, type Drawing } from '../features/gallery/db'

export function Gallery() {
  const { route } = useLocation()
  const [items, setItems] = useState<Drawing[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const urlsRef = useRef<string[]>([])

  function revokeAll() {
    urlsRef.current.forEach(URL.revokeObjectURL)
    urlsRef.current = []
  }

  async function load() {
    const ds = await listDrawings()
    revokeAll()
    const map: Record<string, string> = {}
    ds.forEach((d) => {
      const u = URL.createObjectURL(d.blob)
      map[d.id] = u
      urlsRef.current.push(u)
    })
    setItems(ds)
    setUrls(map)
  }

  useEffect(() => {
    load()
    return revokeAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function remove(id: string) {
    await deleteDrawing(id)
    await load()
  }

  return (
    <div class="gallery">
      <header class="home-top">
        <button class="icon-btn" onClick={() => route('/')} aria-label="Volver">←</button>
        <h1 class="home-title">🖼️ Mis dibujos</h1>
        <span style="width:56px" />
      </header>

      {items.length === 0 ? (
        <div class="loading">
          <p>Todavía no guardaste dibujos 🎨</p>
          <button class="btn-big primary" onClick={() => route('/')}>¡A pintar!</button>
        </div>
      ) : (
        <main class="gallery-grid">
          {items.map((d) => (
            <figure key={d.id} class="gallery-item">
              <img src={urls[d.id]} alt={d.animalName} />
              <figcaption>{d.animalName}</figcaption>
              <button class="del-btn" onClick={() => remove(d.id)} aria-label="Borrar">🗑️</button>
            </figure>
          ))}
        </main>
      )}
    </div>
  )
}
