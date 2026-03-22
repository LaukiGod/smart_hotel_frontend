import { useState } from 'react'
import CustomerApp from './pages/CustomerApp'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import styles from './App.module.css'

export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'customer' | 'dashboard'

  if (view === 'customer') return <CustomerApp onExit={() => setView('landing')} />
  if (view === 'dashboard') return <Dashboard onExit={() => setView('landing')} />
  return <Landing onSelect={setView} />
}
