import styles from './UI.module.css'

export function Card({ children, className = '', glow = null, style = {} }) {
  return (
    <div
      className={`${styles.card} ${glow === 'ember' ? styles.glowEmber : glow === 'cyan' ? styles.glowCyan : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, loading = false, fullWidth = false, type = 'button' }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]} ${fullWidth ? styles.btnFull : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <span className={styles.spinner} /> : null}
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, placeholder, type = 'text', error, hint, name }) {
  return (
    <div className={styles.fieldWrap}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <span className={styles.errorText}>{error}</span>}
      {hint && !error && <span className={styles.hintText}>{hint}</span>}
    </div>
  )
}

export function Badge({ children, variant = 'default' }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{children}</span>
  )
}

export function Spinner({ size = 20, color = 'ember' }) {
  return (
    <div
      className={styles.spinnerStandalone}
      style={{
        width: size, height: size,
        borderColor: color === 'cyan' ? 'var(--cyan-glow-strong)' : 'var(--ember-glow-strong)',
        borderTopColor: color === 'cyan' ? 'var(--cyan)' : 'var(--ember)',
      }}
    />
  )
}

export function SectionTitle({ children, mono = false }) {
  return (
    <div className={`${styles.sectionTitle} ${mono ? 'mono' : ''}`}>
      <span className={styles.sectionLine} />
      {children}
    </div>
  )
}

export function EmptyState({ icon, title, sub }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyTitle}>{title}</div>
      {sub && <div className={styles.emptySub}>{sub}</div>}
    </div>
  )
}
