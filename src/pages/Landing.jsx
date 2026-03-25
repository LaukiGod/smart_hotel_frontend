import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1600&q=85',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=85',
]

function Logo({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="var(--ember)" strokeWidth="1.2" opacity="0.35" />
      <path
        d="M20 8 C20 8 29 13.5 29 20 C29 27 20 32 20 32 C20 32 11 27 11 20 C11 13.5 20 8 20 8Z"
        fill="var(--ember)" opacity="0.92"
      />
      <circle cx="20" cy="20" r="5.5" fill="rgba(7,8,9,0.95)" />
      <circle cx="20" cy="20" r="2.5" fill="var(--ember)" />
      <line x1="20" y1="1.5" x2="20" y2="8.5" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <circle cx="20" cy="1.5" r="1.8" fill="var(--cyan)" opacity="0.85" />
    </svg>
  )
}

const STATS = [
  { val: '09', label: 'Active Tables',  color: 'var(--ember)' },
  { val: 'AI', label: 'Allergy Engine', color: 'var(--cyan)' },
  { val: '3',  label: 'Order States',   color: 'var(--text-secondary)' },
  { val: 'RT', label: 'Real-time',      color: 'var(--ember)' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [imgIndex, setImgIndex] = useState(0)
  const [loaded, setLoaded]     = useState(false)
  const [hovCard, setHovCard]   = useState(null)

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 60)
    const t2 = setInterval(() => setImgIndex(i => (i + 1) % FOOD_IMAGES.length), 5500)
    return () => { clearTimeout(t1); clearInterval(t2) }
  }, [])

  return (
    <div className={styles.root}>

      {/* ── Background ── */}
      <div className={styles.bgWrap}>
        {FOOD_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`${styles.bgSlide} ${i === imgIndex ? styles.bgSlideActive : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className={styles.bgLeft} />
        <div className={styles.bgFade} />
        <div className={styles.bgBottom} />
        <div className={styles.bgVignette} />
      </div>

      {/* ── Page ── */}
      <div className={`${styles.page} ${loaded ? styles.pageVisible : ''}`}>

        {/* Nav */}
        <nav className={styles.nav}>
          <div className={styles.brand}>
            <Logo size={36} />
            <div className={styles.brandText}>
              <span className={`${styles.brandName} display`}>ChefSense</span>
              <span className={`${styles.brandSub} mono`}>Restaurant Intelligence</span>
            </div>
          </div>
          <div className={`${styles.onlineBadge} mono`}>
            <span className={styles.onlineDot} />
            SYSTEM ONLINE
          </div>
        </nav>

        {/* Hero */}
        <main className={styles.hero}>
          <div className={styles.accentLine} />

          <div className={styles.heroInner}>
            <div className={`${styles.pill} mono animate-fade-up`}>
              <span className={styles.pillDot} />
              Food Intelligence Platform
            </div>

            <h1 className={`${styles.headline} display animate-fade-up delay-1`}>
              Where great food<br />
              meets <span className={styles.headlineAccent}>smart systems</span>
            </h1>

            <p className={`${styles.sub} animate-fade-up delay-2`}>
              AI-powered ordering with real-time allergy detection.
              <br />Frictionless from your table to the kitchen.
            </p>

            {/* Portal cards */}
            <div className={`${styles.cards} animate-fade-up delay-3`}>

              <button
                className={`${styles.card} ${styles.cardCustomer}`}
                onClick={() => navigate('/customer')}
                onMouseEnter={() => setHovCard('c')}
                onMouseLeave={() => setHovCard(null)}
              >
                <div className={styles.cardGlowEmber} />
                <div className={styles.cardTop}>
                  <div className={styles.iconBoxEmber}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 11l19-9-9 19-2-8-8-2z" stroke="var(--ember)" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`${styles.cardArrow} ${hovCard === 'c' ? styles.cardArrowShift : ''}`}>↗</span>
                </div>
                <div className={`${styles.cardTitle} display`}>Customer Portal</div>
                <div className={`${styles.cardDesc} mono`}>Order · Allergy check · Track</div>
                <div className={styles.cardBottom}>
                  <span className={`${styles.cardCta} mono`}>Enter portal</span>
                  <div className={styles.cardRule} />
                </div>
              </button>

              <button
                className={`${styles.card} ${styles.cardDash}`}
                onClick={() => navigate('/dashboard')}
                onMouseEnter={() => setHovCard('d')}
                onMouseLeave={() => setHovCard(null)}
              >
                <div className={styles.cardGlowCyan} />
                <div className={styles.cardTop}>
                  <div className={styles.iconBoxCyan}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3"  y="3"  width="7" height="7" rx="1.5" stroke="var(--cyan)" strokeWidth="2" />
                      <rect x="14" y="3"  width="7" height="7" rx="1.5" stroke="var(--cyan)" strokeWidth="2" />
                      <rect x="3"  y="14" width="7" height="7" rx="1.5" stroke="var(--cyan)" strokeWidth="2" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="var(--cyan)" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className={`${styles.cardArrowCyan} ${hovCard === 'd' ? styles.cardArrowShift : ''}`}>↗</span>
                </div>
                <div className={`${styles.cardTitle} display`}>Staff Dashboard</div>
                <div className={`${styles.cardDesc} mono`}>Orders · Inventory · Tables</div>
                <div className={styles.cardBottom}>
                  <span className={`${styles.cardCtaCyan} mono`}>Enter dashboard</span>
                  <div className={styles.cardRuleCyan} />
                </div>
              </button>

            </div>
          </div>
        </main>

        {/* Footer stats */}
        <footer className={`${styles.footer} animate-fade-up delay-4`}>
          <div className={styles.footerLine} />
          <div className={styles.statsRow}>
            {STATS.map(({ val, label, color }) => (
              <div key={label} className={styles.stat}>
                <span className={`${styles.statVal} mono`} style={{ color }}>{val}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </footer>

      </div>
    </div>
  )
}