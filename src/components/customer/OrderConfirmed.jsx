import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Card, Button, Badge } from '../UI'
import styles from './CustomerSteps.module.css'

export default function OrderConfirmed({ order, session, onAddMore, onDone }) {
  const [showThankYou, setShowThankYou] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState('')

  // Auto-advance from thank-you screen to login after 3s
  useEffect(() => {
    if (!showThankYou) return
    const t = setTimeout(async () => {
      try {
        await api.clearTable({ tableNo: session.tableNo })
      } catch (_) {}
      onDone()
    }, 3000)
    return () => clearTimeout(t)
  }, [showThankYou])

  async function handleCompleteMeal() {
    setClearing(true)
    setError('')
    try {
      // Show thank-you screen first — clearTable fires inside the useEffect timer
      setShowThankYou(true)
    } catch (err) {
      setError(err.message)
      setClearing(false)
    }
  }

  // ── Thank-you screen ────────────────────────────────────────
  if (showThankYou) {
    return (
      <div className={`${styles.stepWrap} animate-fade-up`} style={{ textAlign: 'center', paddingTop: 48 }}>
        <div className={styles.thankYouEmoji}>🙏</div>
        <div className={`${styles.stepTag} mono`} style={{ justifyContent: 'center', display: 'flex' }}>
          MEAL COMPLETE
        </div>
        <h2 className={`${styles.stepTitle} display`} style={{ fontSize: 'clamp(36px,6vw,64px)' }}>
          Thank you!
        </h2>
        <p className={styles.stepSub} style={{ maxWidth: 340, margin: '0 auto' }}>
          It was a pleasure serving you. We hope to see you again soon. Have a wonderful day! 😊
        </p>
        <div className={styles.thankYouDots}>
          <span className={styles.thankYouDot} style={{ animationDelay: '0s' }} />
          <span className={styles.thankYouDot} style={{ animationDelay: '0.2s' }} />
          <span className={styles.thankYouDot} style={{ animationDelay: '0.4s' }} />
        </div>
        <p className={`mono`} style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: 8 }}>
          Clearing your session…
        </p>
      </div>
    )
  }

  // ── Confirmed screen ─────────────────────────────────────────
  return (
    <div className={`${styles.stepWrap} animate-fade-up`} style={{ textAlign: 'center' }}>
      {/* Success ring */}
      <div className={styles.successRing}>
        <div className={styles.successInner}>✓</div>
      </div>

      <div className={styles.stepHeader} style={{ alignItems: 'center' }}>
        <div className={`${styles.stepTag} mono`}>ORDER PLACED</div>
        <h2 className={`${styles.stepTitle} display`}>We got it!</h2>
        <p className={styles.stepSub}>Your order is in the queue. Sit back and relax.</p>
      </div>

      <Card style={{ textAlign: 'left', marginBottom: 16 }}>
        <div className={styles.orderMeta}>
          <div className={styles.orderMetaRow}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ORDER ID</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {order?.order?._id?.slice(-8)?.toUpperCase() || '—'}
            </span>
          </div>
          <div className={styles.orderMetaRow}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>TABLE</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{session.tableNo}</span>
          </div>
          <div className={styles.orderMetaRow}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>STATUS</span>
            <Badge variant="pending">PENDING</Badge>
          </div>
        </div>

        {order?.allergyAlert && (
          <div className={styles.allergyWarning}>
            <span className={styles.alertIcon}>⚠</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#ffc800', marginBottom: 4 }}>
                Allergy Alert Raised
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Staff have been notified. They will confirm your order is safe.
              </div>
              {order.allergyMatches?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {order.allergyMatches.map((m, i) => (
                    <Badge key={i} variant="warning">{m.allergy} → {m.ingredient}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
          KITCHEN STATUS
        </div>
        <div className={styles.statusTimeline}>
          {[
            { key: 'pending',   label: 'Order Received', icon: '◉' },
            { key: 'preparing', label: 'Being Prepared',  icon: '◎' },
            { key: 'served',    label: 'Served',          icon: '◌' },
          ].map((s, i) => (
            <div key={s.key} className={styles.timelineItem}>
              <div className={`${styles.timelineDot} ${i === 0 ? styles.timelineDotActive : ''}`}>{s.icon}</div>
              <div className={styles.timelineLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {error && (
        <div className={styles.serverError} style={{ marginTop: 16 }}>⚠ {error}</div>
      )}

      {/* Action buttons */}
      <div className={styles.confirmedActions}>
        <Button variant="ghost" size="lg" onClick={onAddMore}>
          + Order More Items
        </Button>
        <Button variant="primary" size="lg" onClick={handleCompleteMeal} loading={clearing}>
          {clearing ? 'Finishing up…' : 'Complete Meal ✓'}
        </Button>
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        "Complete Meal" ends your session and frees the table.
      </p>
    </div>
  )
}
