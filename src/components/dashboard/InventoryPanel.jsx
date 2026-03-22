import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Button, Input, Badge, Spinner, EmptyState, SectionTitle } from '../UI'
import styles from './DashPanels.module.css'

const UNITS = ['kg', 'grams', 'litres', 'ml', 'pieces', 'packets']
const CATS  = ['vegetable', 'fruit', 'dairy', 'meat', 'spice', 'beverage', 'other']

const EMPTY_FORM = { name: '', quantity: '', unit: 'kg', category: 'other', lowStockThreshold: '10', expiryDate: '' }

export default function InventoryPanel() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [adding, setAdding]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    try { setData(await api.getInventory()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function setF(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.quantity) return
    setAdding(true)
    setError('')
    setSuccess('')
    try {
      await api.addInventory({
        name: form.name.trim(),
        quantity: Number(form.quantity),
        unit: form.unit,
        category: form.category,
        lowStockThreshold: Number(form.lowStockThreshold) || 10,
        expiryDate: form.expiryDate || null,
      })
      setSuccess(`"${form.name}" added to inventory`)
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <div className={styles.centered}><Spinner size={32} color="cyan" /></div>

  const alerts = data?.alerts
  const hasAlerts = alerts && (alerts.expiringSoon?.length || alerts.expired?.length || alerts.lowStock?.length)

  return (
    <div className={`${styles.panel} animate-fade-up`}>
      <div className={styles.panelHeader}>
        <div>
          <div className={`${styles.panelTag} mono`}>STOCK</div>
          <h2 className={`${styles.panelTitle} display`}>Inventory</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={load}>↻ Refresh</Button>
          <Button size="sm" onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ Add Item'}
          </Button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>⚠ {error}</div>}
      {success && <div className={styles.successBanner}>✓ {success}</div>}

      {/* Add form */}
      {showForm && (
        <Card className={`${styles.addForm} animate-fade-up`} glow="cyan">
          <div className={`${styles.formTitle} mono`}>ADD INVENTORY ITEM</div>
          <form onSubmit={handleAdd} className={styles.inventoryForm}>
            <Input label="Name" value={form.name} onChange={setF('name')} placeholder="e.g. Peanut Oil" />
            <Input label="Quantity" type="number" value={form.quantity} onChange={setF('quantity')} placeholder="50" />
            <div className={styles.selectWrap}>
              <label className={styles.selectLabel}>Unit</label>
              <select className={styles.selectEl} value={form.unit} onChange={setF('unit')}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className={styles.selectWrap}>
              <label className={styles.selectLabel}>Category</label>
              <select className={styles.selectEl} value={form.category} onChange={setF('category')}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Low Stock Threshold" type="number" value={form.lowStockThreshold} onChange={setF('lowStockThreshold')} placeholder="10" />
            <Input label="Expiry Date (optional)" type="date" value={form.expiryDate} onChange={setF('expiryDate')} />
            <Button type="submit" loading={adding} fullWidth>Add to Inventory</Button>
          </form>
        </Card>
      )}

      {/* Alerts */}
      {hasAlerts && (
        <div className={styles.alertsGrid}>
          {alerts.expired?.length > 0 && (
            <Card className={styles.alertCard} glow="ember">
              <div className={`${styles.alertCardLabel} mono`}>EXPIRED</div>
              {alerts.expired.map(i => (
                <div key={i.name} className={styles.alertItem}>
                  <span>{i.name}</span>
                  <Badge variant="danger">{new Date(i.expiryDate).toLocaleDateString()}</Badge>
                </div>
              ))}
            </Card>
          )}
          {alerts.expiringSoon?.length > 0 && (
            <Card className={styles.alertCard}>
              <div className={`${styles.alertCardLabel} mono`} style={{ color: '#ffc800' }}>EXPIRING SOON</div>
              {alerts.expiringSoon.map(i => (
                <div key={i.name} className={styles.alertItem}>
                  <span>{i.name}</span>
                  <Badge variant="warning">{new Date(i.expiryDate).toLocaleDateString()}</Badge>
                </div>
              ))}
            </Card>
          )}
          {alerts.lowStock?.length > 0 && (
            <Card className={styles.alertCard}>
              <div className={`${styles.alertCardLabel} mono`} style={{ color: 'var(--cyan)' }}>LOW STOCK</div>
              {alerts.lowStock.map(i => (
                <div key={i.name} className={styles.alertItem}>
                  <span>{i.name}</span>
                  <Badge variant="cyan">{i.quantity} {i.unit}</Badge>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Items table */}
      {data?.items?.length > 0 ? (
        <>
          <SectionTitle mono>All Items ({data.total})</SectionTitle>
          <div className={styles.invTable}>
            <div className={`${styles.invHeader} mono`}>
              <span>Name</span><span>Qty</span><span>Unit</span><span>Category</span><span>Expiry</span>
            </div>
            {data.items.map((item, i) => (
              <div
                key={item._id}
                className={`${styles.invRow} animate-fade-up`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</span>
                <span className="mono" style={{ color: item.quantity <= item.lowStockThreshold ? '#ffc800' : 'var(--text-secondary)' }}>
                  {item.quantity}
                </span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>{item.unit}</span>
                <Badge variant="default">{item.category}</Badge>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        !loading && <EmptyState icon="◧" title="Inventory is empty" sub="Add items using the button above" />
      )}
    </div>
  )
}
