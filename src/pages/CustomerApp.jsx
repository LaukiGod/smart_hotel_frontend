import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TableLogin from '../components/customer/TableLogin'
import AllergySetup from '../components/customer/AllergySetup'
import MenuPage from '../components/customer/MenuPage'
import OrderConfirmed from '../components/customer/OrderConfirmed'
import TopBar from '../components/TopBar'
import styles from './CustomerApp.module.css'

const STEPS = ['login', 'allergies', 'menu', 'confirmed']
const STEP_LABELS = { login: 'Table', allergies: 'Allergies', menu: 'Menu', confirmed: 'Order' }

export default function CustomerApp() {
  const navigate = useNavigate()
  const [step, setStep] = useState('login')
  const [session, setSession] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)

  function handleLogin(data) { setSession(data); setStep('allergies') }
  function handleAllergiesDone() { setStep('menu') }
  function handleOrderPlaced(order) { setLastOrder(order); setStep('confirmed') }
  function handleAddMore() { setStep('menu') }
  function handleDone() { setSession(null); setLastOrder(null); setStep('login') }

  const stepIdx = STEPS.indexOf(step)

  return (
    <div className={styles.root}>
      <TopBar
        title="Customer Portal"
        subtitle={session ? `Table ${session.tableNo}` : null}
        onExit={() => navigate('/')}
        accent="ember"
      />

      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <div
          className={styles.progressFill}
          style={{ width: `${((stepIdx) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className={styles.stepRow}>
        {STEPS.map((s, i) => {
          const done    = i < stepIdx
          const current = i === stepIdx
          return (
            <div key={s} className={styles.stepItem}>
              <div className={`${styles.stepDot} ${done ? styles.stepDone : current ? styles.stepCurrent : styles.stepFuture}`}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className={`${styles.stepLabel} mono ${current ? styles.stepLabelActive : ''}`}>
                {STEP_LABELS[s]}
              </span>
            </div>
          )
        })}
      </div>

      <div className={styles.content}>
        {step === 'login'     && <TableLogin onSuccess={handleLogin} />}
        {step === 'allergies' && <AllergySetup session={session} onNext={handleAllergiesDone} />}
        {step === 'menu'      && <MenuPage session={session} onOrderPlaced={handleOrderPlaced} />}
        {step === 'confirmed' && <OrderConfirmed order={lastOrder} session={session} onAddMore={handleAddMore} onDone={handleDone} />}
      </div>
    </div>
  )
}
