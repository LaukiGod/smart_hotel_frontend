import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Button, Input, Spinner } from '../UI'
import styles from './CustomerSteps.module.css'

const ALL_TABLES = [1, 2, 4, 5, 6, 7, 8, 9, 10]

export default function TableLogin({ onSuccess }) {
  const [tableStatuses, setTableStatuses] = useState({})
  const [loadingTables, setLoadingTables] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', phoneNo: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    api.getTables()
      .then(tables => {
        const map = {}
        tables.forEach(t => { map[t.tableNo] = t.status })
        setTableStatuses(map)
      })
      .catch(() => {
        const map = {}
        ALL_TABLES.forEach(n => { map[n] = 'free' })
        setTableStatuses(map)
      })
      .finally(() => setLoadingTables(false))
  }, [])

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function handleSelectTable(n) {
    if (tableStatuses[n] === 'occupied') return
    setSelected(n)
    setServerError('')
    setErrors(e => ({ ...e, table: undefined }))
  }

  function validate() {
    const e = {}
    if (!selected) e.table = 'Please select a table first'
    if (!form.name.trim()) e.name = 'Required'
    if (!form.phoneNo.trim()) e.phoneNo = 'Required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setServerError('')
    try {
      const data = await api.loginTable({
        tableNo: selected,
        name: form.name.trim(),
        phoneNo: form.phoneNo.trim(),
      })
      onSuccess({ tableNo: selected, user: data.user })
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const freeTables = ALL_TABLES.filter(n => tableStatuses[n] !== 'occupied')
  const allOccupied = !loadingTables && freeTables.length === 0

  return (
    <div className={`${styles.stepWrap} animate-fade-up`}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepTag} mono`}>STEP 01</div>
        <h2 className={`${styles.stepTitle} display`}>Pick Your Table</h2>
        <p className={styles.stepSub}>Select an available table to begin your session</p>
      </div>

      <Card>
        <div className={`${styles.tablePickerLabel} mono`}>FLOOR PLAN</div>

        {loadingTables ? (
          <div className={styles.tableLoadingRow}>
            <Spinner size={18} />
            Checking availability…
          </div>
        ) : allOccupied ? (
          <div className={styles.noTablesMsg}>
            <div className={styles.noTablesIcon}>🍽</div>
            <div className={styles.noTablesTitle}>All tables are occupied</div>
            <div className={styles.noTablesSub}>
              We're sorry for the inconvenience. Please check back shortly or speak to our staff.
            </div>
          </div>
        ) : (
          <>
            <div className={styles.tableGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                const doesNotExist = n === 3
                const occupied = tableStatuses[n] === 'occupied'
                const isSelected = selected === n

                return (
                  <button
                    key={n}
                    type="button"
                    disabled={doesNotExist || occupied}
                    onClick={() => handleSelectTable(n)}
                    className={[
                      styles.tableCell,
                      isSelected   ? styles.tableCellActive   : '',
                      occupied     ? styles.tableCellOccupied : '',
                      doesNotExist ? styles.tableCellDisabled : '',
                    ].filter(Boolean).join(' ')}
                    aria-label={doesNotExist ? 'Not available' : occupied ? `Table ${n} occupied` : `Select table ${n}`}
                  >
                    <span className={styles.tableCellNum}>
                      {doesNotExist ? '—' : n}
                    </span>
                    {occupied && !doesNotExist && (
                      <span className={styles.lockIcon}>🔒</span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className={styles.tableLegend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendFree}`} />
                Available
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendOccupied}`} />
                Occupied
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendSelected}`} />
                Selected
              </span>
            </div>
          </>
        )}

        {errors.table && (
          <div className={styles.serverError} style={{ marginTop: 12 }}>
            <span>⚠</span> {errors.table}
          </div>
        )}
      </Card>

      {selected && !allOccupied && (
        <Card className="animate-scale-in">
          <div className={`${styles.tablePickerLabel} mono`} style={{ marginBottom: 18 }}>
            YOUR DETAILS — TABLE {selected}
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input label="Your Name" value={form.name} onChange={set('name')} placeholder="e.g. Ravi Kumar" error={errors.name} />
            <Input label="Phone Number" value={form.phoneNo} onChange={set('phoneNo')} placeholder="e.g. 9876543210" error={errors.phoneNo} />
            {serverError && (
              <div className={styles.serverError}><span>⚠</span> {serverError}</div>
            )}
            <Button type="submit" loading={loading} fullWidth size="lg">
              {loading ? 'Claiming…' : `Claim Table ${selected} →`}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
