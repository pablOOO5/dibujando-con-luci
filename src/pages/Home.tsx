import { useEffect, useState } from 'preact/hooks'
import { useNav } from '../lib/nav'
import { loadContent, animalsByCategory } from '../content/loader'
import { asset } from '../lib/assets'
import type { ContentManifest } from '../types'

export function Home() {
  const route = useNav()
  const [content, setContent] = useState<ContentManifest | null>(null)
  const [cat, setCat] = useState('')

  useEffect(() => {
    loadContent().then((c) => {
      setContent(c)
      setCat(c.categories[0]?.id ?? '')
    })
  }, [])

  if (!content) return <div class="loading">Cargando…</div>

  const animals = animalsByCategory(content, cat)

  return (
    <div class="home">
      <header class="home-top">
        <h1 class="home-title">🐨 Dibujando con Luci</h1>
        <div class="home-actions">
          <button class="icon-btn" onClick={() => route('/galeria')} aria-label="Mis dibujos">🖼️</button>
          <button class="icon-btn" onClick={() => route('/ajustes')} aria-label="Ajustes">⚙️</button>
        </div>
      </header>

      <nav class="categories" aria-label="Categorias">
        {content.categories.map((c) => (
          <button
            key={c.id}
            class={`cat ${c.id === cat ? 'active' : ''}`}
            onClick={() => setCat(c.id)}
          >
            <span class="cat-emoji" aria-hidden="true">{c.emoji}</span>
            <span class="cat-name">{c.name}</span>
          </button>
        ))}
      </nav>

      <main class="animal-grid">
        <button class="animal-card libre" onClick={() => route('/libre')}>
          <span class="libre-emoji" aria-hidden="true">✏️</span>
          <span class="animal-name">Dibujo libre</span>
        </button>
        {animals.map((a) => (
          <button key={a.id} class={`animal-card ${a.favorite ? 'fav' : ''}`} onClick={() => route(`/colorear/${a.id}`)}>
            {a.favorite && <span class="fav-star" aria-hidden="true">⭐</span>}
            <img src={asset(a.thumb ?? a.lineArt)} alt={a.name} loading="lazy" />
            <span class="animal-name">{a.name}</span>
          </button>
        ))}
      </main>
    </div>
  )
}
