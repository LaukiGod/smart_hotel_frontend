import styles from './TopBar.module.css'

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="var(--ember)" strokeWidth="1.5" opacity="0.3"/>
      <path d="M16 6 C16 6 22 10 22 16 C22 22 16 26 16 26 C16 26 10 22 10 16 C10 10 16 6 16 6Z"
            fill="var(--ember)" opacity="0.9"/>
      <circle cx="16" cy="16" r="4" fill="var(--bg-base)"/>
      <circle cx="16" cy="16" r="2" fill="var(--ember)"/>
      <path d="M16 2 L16 8" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M16 24 L16 30" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}

export default function TopBar({ title, subtitle, onExit, accent = 'ember' }) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <Logo size={28} />
        <div className={styles.brand}>
          <span className={`${styles.brandName} display`}>ChefSense</span>
          <span className={`${styles.brandSub} mono`}>{title}</span>
        </div>
        {subtitle && (
          <div className={`${styles.sessionTag} mono ${accent === 'cyan' ? styles.sessionCyan : styles.sessionEmber}`}>
            {subtitle}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={`${styles.liveIndicator} mono`}>
          <span className={`${styles.liveDot} ${accent === 'cyan' ? styles.liveCyan : styles.liveEmber}`} />
          LIVE
        </div>
        <button className={styles.exit} onClick={onExit}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 1H13V13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 7H9M6 4L9 7L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Exit
        </button>
      </div>
    </div>
  )
}
