import { useLocation } from 'preact-iso'

// Base sin barra final: '' en dev, '/dibujando-con-luci' en GitHub Pages.
// preact-iso matchea contra location.pathname completo, asi que tenemos que
// anteponer el base tanto en las rutas (app.tsx) como al navegar.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

// Antepone el base a un path absoluto de la app (p.ej. '/galeria').
export const path = (p: string): string => BASE + p

// route() consciente del base: en las pantallas se sigue llamando route('/galeria').
export function useNav() {
  const { route } = useLocation()
  return (p: string, replace?: boolean) => route(BASE + p, replace)
}
