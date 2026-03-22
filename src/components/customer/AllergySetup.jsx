import { useState } from 'react'
import { api } from '../../utils/api'
import { Card, Button, Badge } from '../UI'
import styles from './CustomerSteps.module.css'

const COMMON = ['Peanut', 'Gluten', 'Milk', 'Egg', 'Soy', 'Shellfish', 'Tree Nut', 'Fish', 'Wheat', 'Sesame']

export default function AllergySetup({ session, onNext }) {
  const [selected, setSelected] = useState([])
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggle(name) {
    setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name])
  }

  function addCustom() {
    const v = custom.trim()
    if (v && !selected.includes(v)) setSelected(s => [...s, v])
    setCustom('')
  }

  function removeAllergy(name) {
    setSelected(s => s.filter(x => x !== name))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      await api.setAllergies({
        tableNo: session.tableNo,
        allergies: selected.map(s => s.toLowerCase()),
      })
      onNext()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.stepWrap} animate-fade-up`}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepTag} mono`}>STEP 02</div>
        <h2 className={`${styles.stepTitle} display`}>Any Allergies?</h2>
        <p className={styles.stepSub}>Our AI will flag your order if ingredients match. You can skip this.</p>
      </div>

      <Card>
        <div className={styles.allergyGrid}>
          {COMMON.map(name => (
            <button
              key={name}
              type="button"
              className={`${styles.allergyChip} ${selected.includes(name) ? styles.allergyChipActive : ''}`}
              onClick={() => toggle(name)}
            >
              {selected.includes(name) && <span className={styles.checkMark}>✓ </span>}
              {name}
            </button>
          ))}
        </div>

        {/* Custom allergy */}
        <div className={styles.customWrap}>
          <input
            className={styles.customInput}
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="Type a custom allergy and press Enter…"
          />
          <button type="button" className={styles.customAdd} onClick={addCustom}>+</button>
        </div>

        {/* Selected */}
        {selected.length > 0 && (
          <div className={styles.selectedWrap}>
            <span className={`${styles.selectedWrapLabel} mono`}>FLAGGED</span>
            <div className={styles.selectedList}>
              {selected.map(s => (
                <span key={s} className={styles.selectedTag}>
                  {s}
                  <button onClick={() => removeAllergy(s)} className={styles.removeTag}>✕</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {error && <div className={styles.serverError}><span>⚠</span> {error}</div>}

        <div className={styles.allergyActions}>
          <Button variant="ghost" onClick={onNext} size="md">Skip →</Button>
          <Button onClick={handleSubmit} loading={loading} size="md">
            {selected.length > 0 ? `Save ${selected.length} Allerg${selected.length > 1 ? 'ies' : 'y'} →` : 'Continue →'}
          </Button>
        </div>
      </Card>

      {/* AI badge */}
      <div className={styles.aiBadge}>
        <span className={styles.aiDot} />
        <span className={`mono`} style={{ fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.1em' }}>
          AI ALLERGY ENGINE ACTIVE — ingredients checked at order time
        </span>
      </div>
    </div>
  )
}
