import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Badge, Spinner, Button, EmptyState } from '../UI'
import styles from './DashPanels.module.css'

export default function TablesPanel() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try { setTables(await api.getTables()) }
    catch (_) {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleClearTable(tableNo) {
    setClearing(tableNo)
    setError('')
    try {
      await api.clearTable({ tableNo })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setClearing(null)
    }
  }

  if (loading) return <div className={styles.centered}><Spinner size={32} color="cyan" /></div>

  const occupied = tables.filter(t => t.status === 'occupied')
  const freeCount = tables.length - occupied.length

  return (
    <div className={`${styles.panel} animate-fade-up`}>
      <div className={styles.panelHeader}>
        <div>
          <div className={`${styles.panelTag} mono`}>LIVE</div>
          <h2 className={`${styles.panelTitle} display`}>Tables</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Badge variant="ember">{occupied.length} Occupied</Badge>
          <Badge variant="success">{freeCount} Free</Badge>
          <Button variant="ghost" size="sm" onClick={load}>↻</Button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>⚠ {error}</div>}

      {occupied.length === 0 ? (
        <EmptyState icon="✓" title="No occupied tables" sub="All tables are currently free" />
      ) : (
        <div className={styles.tableStatusGrid}>
          {occupied.map((table, i) => (
            <Card
              key={table._id}
              className={`${styles.tableStatusCard} animate-fade-up`}
              style={{ animationDelay: `${i * 0.04}s` }}
              glow={table.allergyAlert ? 'ember' : null}
            >
              <div className={styles.tableTopRow}>
                <div className={`${styles.tableNumLarge} mono`}>T{table.tableNo}</div>
                <Badge variant="ember">OCCUPIED</Badge>
              </div>

              {table.currentUser && (
                <div className={styles.tableUserInfo}>
                  <div className={styles.tableUserName}>{table.currentUser.name}</div>
                  <div className={`${styles.tableUserPhone} mono`}>{table.currentUser.phoneNo}</div>
                  {table.currentUser.allergies?.length > 0 && (
                    <div className={styles.tableAllergyList}>
                      {table.currentUser.allergies.map(a => (
                        <Badge key={a} variant="warning">{a}</Badge>
                      ))}
                    </div>
                  )}
                  {table.allergyAlert && (
                    <div className={styles.tableAlert}>
                      <span>⚠</span> Allergy alert active
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={clearing === table.tableNo}
                  onClick={() => handleClearTable(table.tableNo)}
                >
                  {clearing === table.tableNo ? 'Clearing…' : '✕ Clear Table'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
