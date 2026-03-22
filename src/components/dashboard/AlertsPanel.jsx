import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Badge, Spinner, EmptyState } from '../UI'
import styles from './DashPanels.module.css'

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getAlerts()
      .then(setAlerts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.centered}><Spinner size={32} color="cyan" /></div>

  return (
    <div className={`${styles.panel} animate-fade-up`}>
      <div className={styles.panelHeader}>
        <div>
          <div className={`${styles.panelTag} mono`} style={{ color: '#ffc800' }}>WARNING</div>
          <h2 className={`${styles.panelTitle} display`}>Allergy Alerts</h2>
        </div>
        <Badge variant="warning">{alerts.length} Active</Badge>
      </div>

      {error && <div className={styles.errorBanner}>⚠ {error}</div>}

      {alerts.length === 0 && (
        <EmptyState icon="✓" title="No allergy alerts" sub="All clear — no flagged orders right now" />
      )}

      <div className={styles.orderList}>
        {alerts.map((order, i) => (
          <Card
            key={order._id}
            glow="ember"
            className={`${styles.orderCard} animate-fade-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={styles.alertHeader}>
              <div className={styles.alertPulse}>
                <span className={styles.alertDot} />
                <span className={`mono`} style={{ fontSize: 11, color: '#ffc800', letterSpacing: '0.1em' }}>
                  ALLERGY ALERT
                </span>
              </div>
              <span className={`mono`} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                T{order.tableNo} · #{order._id?.slice(-6)?.toUpperCase()}
              </span>
            </div>

            <div className={styles.alertDishes}>
              {order.dishes?.map(d => (
                <Badge key={d._id} variant="default">{d.name}</Badge>
              ))}
            </div>

            {order.allergiesInput?.length > 0 && (
              <div className={styles.alertSection}>
                <div className={`${styles.alertSectionLabel} mono`}>CUSTOMER ALLERGIES</div>
                <div className={styles.alertTags}>
                  {order.allergiesInput.map(a => (
                    <Badge key={a} variant="warning">{a}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.alertNote}>
              <span style={{ color: '#ffc800' }}>⚠</span>
              Staff action required — confirm with the customer before serving
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
