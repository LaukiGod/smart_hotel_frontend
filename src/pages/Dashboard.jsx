import { useState } from 'react'
import TopBar from '../components/TopBar'
import OrdersPanel from '../components/dashboard/OrdersPanel'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import TablesPanel from '../components/dashboard/TablesPanel'
import InventoryPanel from '../components/dashboard/InventoryPanel'
import MenuManage from '../components/dashboard/MenuManage'
import styles from './Dashboard.module.css'

const TABS = [
  { id: 'orders',    label: 'Orders',    icon: '⬡' },
  { id: 'alerts',    label: 'Alerts',    icon: '◉' },
  { id: 'tables',    label: 'Tables',    icon: '▦' },
  { id: 'inventory', label: 'Inventory', icon: '◧' },
  { id: 'menu',      label: 'Menu',      icon: '✦' },
]

export default function Dashboard({ onExit }) {
  const [tab, setTab] = useState('orders')

  return (
    <div className={styles.root}>
      <TopBar
        title="Staff Dashboard"
        subtitle="Management Console"
        onExit={onExit}
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
