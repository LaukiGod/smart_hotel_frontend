import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import OrdersPanel from '../components/dashboard/OrdersPanel'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import TablesPanel from '../components/dashboard/TablesPanel'
import InventoryPanel from '../components/dashboard/InventoryPanel'
import MenuManage from '../components/dashboard/MenuManage'
import { getSecret, saveSecret } from '../utils/api'
import styles from './Dashboard.module.css'

const TABS = [
  { id: 'orders',    label: 'Orders',    icon: '⬡' },
  { id: 'alerts',    label: 'Alerts',    icon: '◉' },
  { id: 'tables',    label: 'Tables',    icon: '▦' },
  { id: 'inventory', label: 'Inventory', icon: '◧' },
  { id: 'menu',      label: 'Menu',      icon: '✦' },
]

// ── Secret Gate ───────────────────────────────────────────
function SecretGate({ onUnlock }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim()) return
    saveSecret(code.trim())
    onUnlock()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: '1.2rem'
    }}>
      <div style={{ fontSize: '1.1rem', color: 'var(--cyan)', letterSpacing: 2 }} className="mono">
        STAFF ACCESS
      </div>
      <h2 className="display" style={{ color: 'var(--text)', margin: 0 }}>
        Enter Restaurant Code
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: 280 }}>
        <input
          type="password"
          placeholder="Secret code"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          style={{
            padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)', fontSize: '1rem'
          }}
          autoFocus
        />
        {error && <span style={{ color: 'var(--ember)', fontSize: '0.85rem' }}>{error}</span>}
        <button
          type="submit"
          style={{
            padding: '0.75rem', borderRadius: 8, background: 'var(--cyan)',
            color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer'
          }}
        >
          Unlock Dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.85rem'
          }}
        >
          ← Back to home
        </button>
      </form>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('orders')
  const [unlocked, setUnlocked] = useState(!!getSecret())

// re-check if secret gets cleared (e.g. 403 from API)
useEffect(() => {
  const interval = setInterval(() => {
    if (!getSecret()) setUnlocked(false)
  }, 1000)
  return () => clearInterval(interval)
}, [])

  if (!unlocked) {
    return <SecretGate onUnlock={() => setUnlocked(true)} />
  }

  return (
    <div className={styles.root}>
      <TopBar
        title="Staff Dashboard"
        subtitle="Management Console"
        onExit={() => navigate('/')}
        accent="cyan"
      />

      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''} mono`}
            onClick={() => setTab(t.id)}
          >
            <span className={styles.tabIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <div className="animate-fade-up">
          {tab === 'orders'    && <OrdersPanel />}
          {tab === 'alerts'    && <AlertsPanel />}
          {tab === 'tables'    && <TablesPanel />}
          {tab === 'inventory' && <InventoryPanel />}
          {tab === 'menu'      && <MenuManage />}
        </div>
      </div>
    </div>
  )
}