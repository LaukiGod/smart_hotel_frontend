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
  const [deleting, setDeleting] = useState(null)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [quantityEdits, setQuantityEdits] = useState({})

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

  async function handleDelete(item) {
    if (!window.confirm(`Remove "${item.name}" from inventory?`)) return
    setDeleting(item._id)
    setError('')
    setSuccess('')
    try {
      await api.deleteInventory(item._id)
      setSuccess(`"${item.name}" removed from inventory`)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(null)
    }
  }

  function handleEdit(item) {
    setForm({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      category: item.category,
      lowStockThreshold: item.lowStockThreshold.toString(),
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
    })
    setEditingId(item._id)
    setShowForm(true)
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.quantity) return
    setAdding(true)
    setError('')
    setSuccess('')
    try {
      await api.updateInventory(editingId, {
        name: form.name.trim(),
        quantity: Number(form.quantity),
        unit: form.unit,
        category: form.category,
        lowStockThreshold: Number(form.lowStockThreshold) || 10,
        expiryDate: form.expiryDate || null,
      })
      setSuccess(`"${form.name}" updated successfully`)
      setForm(EMPTY_FORM)
      setEditingId(null)
      setShowForm(false)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleQuantityChange(item, newQuantity) {
    if (newQuantity < 0) {
      setError('Quantity cannot be negative')
      return
    }
    setQuantityEdits(prev => ({ ...prev, [item._id]: newQuantity }))
  }

  async function handleSaveQuantity(item) {
    const newQuantity = quantityEdits[item._id]
    setUpdating(item._id)
    setError('')
    setSuccess('')
    try {
      await api.updateInventory(item._id, { quantity: newQuantity })
      setSuccess(`Quantity updated to ${newQuantity}`)
      setQuantityEdits(prev => {
        const newEdits = { ...prev }
        delete newEdits[item._id]
        return newEdits
      })
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setUpdating(null)
    }
  }

  function handleCancelQuantity(itemId) {
    setQuantityEdits(prev => {
      const newEdits = { ...prev }
      delete newEdits[itemId]
      return newEdits
    })
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
          <Button size="sm" onClick={() => {
            if (showForm) {
              setShowForm(false)
              setEditingId(null)
              setForm(EMPTY_FORM)
            } else {
              setShowForm(true)
            }
          }}>
            {showForm ? '✕ Cancel' : '+ Add Item'}
          </Button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>⚠ {error}</div>}
      {success && <div className={styles.successBanner}>✓ {success}</div>}

      {/* Add form */}
      {showForm && (
        <Card className={`${styles.addForm} animate-fade-up`} glow="cyan">
          <div className={`${styles.formTitle} mono`}>{editingId ? 'EDIT ITEM' : 'ADD INVENTORY ITEM'}</div>
          <form onSubmit={editingId ? handleSaveEdit : handleAdd} className={styles.inventoryForm}>
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
            <Button type="submit" loading={adding} fullWidth>{editingId ? 'Save Changes' : 'Add to Inventory'}</Button>
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
              <span>Name</span><span>Qty</span><span>Unit</span><span>Category</span><span>Expiry</span><span></span>
            </div>
            {data.items.map((item, i) => (
              <div
                key={item._id}
                className={`${styles.invRow} animate-fade-up`}
                style={{ animationDelay: `${i * 0.03}s`, display: 'flex', flexDirection: quantityEdits[item._id] !== undefined ? 'column' : 'row', alignItems: quantityEdits[item._id] !== undefined ? 'stretch' : 'center', gap: quantityEdits[item._id] !== undefined ? 12 : 0 }}
              >
                {quantityEdits[item._id] !== undefined && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ padding: '4px 10px', minWidth: 'auto', color: 'var(--cyan)', fontSize: 12 }}
                      onClick={() => handleSaveQuantity(item)}
                      loading={updating === item._id}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ padding: '4px 10px', minWidth: 'auto', color: '#ff6b35', fontSize: 12 }}
                      onClick={() => handleCancelQuantity(item._id)}
                      disabled={updating === item._id}
                    >
                      Decline Changes
                    </Button>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</span>
                  {quantityEdits[item._id] !== undefined ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="mono">
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ padding: '4px 8px', minWidth: 'auto', fontSize: 16 }}
                        onClick={() => handleQuantityChange(item, (quantityEdits[item._id] ?? item.quantity) - 1)}
                        disabled={updating === item._id}
                      >
                        −
                      </Button>
                      <span style={{ color: '#ffc800', minWidth: 50, textAlign: 'center', fontWeight: 600, fontSize: 16 }}>
                        {quantityEdits[item._id]}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ padding: '4px 8px', minWidth: 'auto', fontSize: 16 }}
                        onClick={() => handleQuantityChange(item, (quantityEdits[item._id] ?? item.quantity) + 1)}
                        disabled={updating === item._id}
                      >
                        +
                      </Button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="mono">
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ padding: '4px 8px', minWidth: 'auto', fontSize: 16 }}
                        onClick={() => handleQuantityChange(item, (quantityEdits[item._id] ?? item.quantity) - 1)}
                        disabled={updating === item._id}
                      >
                        −
                      </Button>
                      <span style={{ color: item.quantity <= item.lowStockThreshold ? '#ffc800' : 'var(--text-secondary)', minWidth: 50, textAlign: 'center', fontWeight: 500, fontSize: 14 }}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ padding: '4px 8px', minWidth: 'auto', fontSize: 16 }}
                        onClick={() => handleQuantityChange(item, (quantityEdits[item._id] ?? item.quantity) + 1)}
                        disabled={updating === item._id}
                      >
                        +
                      </Button>
                    </div>
                  )}
                  <span className="mono" style={{ color: 'var(--text-muted)' }}>{item.unit}</span>
                  <Badge variant="default">{item.category}</Badge>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      style={{ color: 'var(--cyan)' }}
                    >
                      ✎ Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deleting === item._id}
                      onClick={() => handleDelete(item)}
                      style={{ color: '#ff6b35' }}
                    >
                      {deleting === item._id ? '…' : 'Delete Item'}
                    </Button>
                  </div>
                </div>
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
