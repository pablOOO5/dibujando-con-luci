import { LocationProvider, Router, Route } from 'preact-iso'
import { Home } from './pages/Home'
import { Coloring } from './pages/Coloring'
import { Gallery } from './pages/Gallery'
import { Settings } from './pages/Settings'
import { BASE, path } from './lib/nav'
import { useBathroomReminder } from './features/reminder/useBathroomReminder'
import { ReminderPrompt } from './features/reminder/ReminderPrompt'

export function App() {
  // El recordatorio de bano es global: corre en cualquier pantalla.
  const reminder = useBathroomReminder()

  return (
    <LocationProvider scope={BASE || undefined}>
      <div class="app">
        <Router>
          <Route path={path('/')} component={Home} />
          <Route path={path('/colorear/:id')} component={Coloring} />
          <Route path={path('/galeria')} component={Gallery} />
          <Route path={path('/ajustes')} component={Settings} />
          <Route default component={Home} />
        </Router>
      </div>
      {reminder.active && <ReminderPrompt onDone={reminder.dismiss} />}
    </LocationProvider>
  )
}
