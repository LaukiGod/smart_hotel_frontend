import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Button, Badge, Spinner, EmptyState, SectionTitle } from '../UI'
import styles from './DashPanels.module.css'

const STATUS_FLOW = ['pending', 'preparing', 'served']

function nextStatus(current) {
  const i = STATUS_FLOW.indexOf(current)
  return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null
}

const STATUS_LABELS = {
  pending:   { label: 'Pending',   variant: 'pending' },
  preparing: { label: 'Preparing', variant: 'preparing' },
  served:    { label: 'Served',    variant: 'served' },
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await api.getOrders()
      setOrders(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function advance(order) {
    const next = nextStatus(order.status)
    if (!next) return
    setUpdating(u => ({ ...u, [order._id]: true }))
    try {
      const result = await api.updateOrderStatus({ orderId: order._id, status: next })
      setOrders(o => o.map(x => x._id === order._id ? result.order : x))
    } catch (e) {
      setError(e.message)
    } finally {
      setUpdating(u => ({ ...u, [order._id]: false }))
    }
  }

  if (loading) return <div className={styles.centered}><Spinner size={32} color="cyan" /></div>

  return (
    <div className={`${styles.panel} animate-fade-up`}>
      <div className={styles.panelHeader}>
        <div>
          <div className={`${styles.panelTag} mono`}>LIVE</div>
          <h2 className={`${styles.panelTitle} display`}>Orders</h2>
        </div>
        <Button variant="ghost" onClick={load} size="sm">↻ Refresh</Button>
      </div>

      {error && <div className={styles.errorBanner}>⚠ {error}</div>}

      {orders.length === 0 && (
        <EmptyState icon="◈" title="No orders yet" sub="Orders will appear here when customers place them" />
      )}

      <div className={styles.orderList}>
        {orders.map((order, i) => {
          const meta = STATUS_LABELS[order.status] || STATUS_LABELS.pending
          const next = nextStatus(order.status)
          const isUpdating = updating[order._id]

          return (
            <Card
              key={order._id}
              className={`${styles.orderCard} animate-fade-up`}
              style={{ animationDelay: `${i * 0.04}s` }}
              glow={order.allergyAlert ? 'ember' : null}
            >
              <div className={styles.orderTop}>
                <div className={styles.orderLeft}>
                  <div className={styles.tableNum}>T{order.tableNo}</div>
                  <div>
                    <div className={styles.orderDishes}>
                      {order.dishes?.map(d => d.name || 'Dish').join(', ') || '—'}
                    </div>
                    <div className={`${styles.orderId} mono`}>
                      #{order._id?.slice(-6)?.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className={styles.orderRight}>
                  {order.allergyAlert && (
                    <Badge variant="warning">⚠ ALLERGY</Badge>
                  )}
                  <Badge variant={meta.variant}>{meta.label.toUpperCase()}</Badge>
                </div>
              </div>

              <div className={styles.orderBottom}>
                <span className={`${styles.orderTime} mono`}>
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {next ? (
                  <Button
                    size="sm"
                    variant={next === 'served' ? 'ghost' : 'cyan'}
                    onClick={() => advance(order)}
                    loading={isUpdating}
                  >
                    Mark {next} →
                  </Button>
                ) : (
                  <span className={`${styles.doneLabel} mono`}>✓ Complete</span>
                )}
              </div>

              {/* Status progress bar */}
              <div className={styles.progressWrap}>
                {STATUS_FLOW.map((s, si) => (
                  <div
                    key={s}
                    className={`${styles.progressSeg} ${STATUS_FLOW.indexOf(order.status) >= si ? styles.progressActive : ''}`}
                  />
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
