import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Badge, Spinner, Button } from '../UI'
import styles from './DashPanels.module.css'

export default function TablesPanel() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try { setTables(await api.getTables()) }
    catch (_) {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className={styles.centered}><Spinner size={32} color="cyan" /></div>

  const occupied = tables.filter(t => t.status === 'occupied').length
  const free     = tables.filter(t => t.status === 'free').length

  return (
    <div className={`${styles.panel} animate-fade-up`}>
      <div className={styles.panelHeader}>
        <div>
          <div className={`${styles.panelTag} mono`}>LIVE</div>
          <h2 className={`${styles.panelTitle} display`}>Tables</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Badge variant="ember">{occupied} Occupied</Badge>
          <Badge variant="success">{free} Free</Badge>
          <Button variant="ghost" size="sm" onClick={load}>↻</Button>
        </div>
      </div>

      <div className={styles.tableStatusGrid}>
        {tables.map((table, i) => {
          const isOcc = table.status === 'occupied'
          return (
            <Card
              key={table._id}
              className={`${styles.tableStatusCard} animate-fade-up`}
              style={{ animationDelay: `${i * 0.04}s` }}
              glow={table.allergyAlert ? 'ember' : null}
            >
              <div className={styles.tableTopRow}>
                <div className={`${styles.tableNumLarge} mono`}>T{table.tableNo}</div>
                <Badge variant={isOcc ? 'ember' : 'success'}>
                  {isOcc ? 'OCCUPIED' : 'FREE'}
                </Badge>
              </div>

              {isOcc && table.currentUser ? (
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
              ) : (
                <div className={styles.tableEmpty}>Available</div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
