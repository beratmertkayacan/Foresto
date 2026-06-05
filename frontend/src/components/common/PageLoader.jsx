import Logo from './Logo.jsx'

/**
 * Sayfa içi yükleme — koyu zemin üzerinde markalı gösterge
 * @param {boolean} fullHeight — min-height viewport benzeri
 * @param {string} label
 */
export default function PageLoader({ fullHeight = true, label = 'Yükleniyor…' }) {
  return (
    <div
      className={`page-loader${fullHeight ? ' page-loader--tall' : ''}`}
      role="status"
      aria-live="polite"
    >
      <Logo variant="icon" size="md" theme="dark" decorative />
      <div className="page-loader__spark" aria-hidden="true">
        <svg viewBox="0 0 120 30" className="page-loader__spark-svg">
          <path
            className="page-loader__spark-line"
            d="M0,22 L18,18 L36,20 L54,12 L72,14 L90,6 L108,8 L120,4"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="page-loader__label ss-ink-dim">{label}</p>
    </div>
  )
}
