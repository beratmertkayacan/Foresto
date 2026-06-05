import { Link } from 'react-router-dom'

export default function EmptyState({
  icon = '📭',
  title = 'Henüz veri yok',
  description = 'İlk kaydınızı ekleyerek başlayın.',
  ctaLabel,
  ctaTo,
  onCtaClick,
  compact = false,
}) {
  return (
    <div className={`ss-card ss-card--static text-center ${compact ? 'py-8 px-5' : 'py-12 px-6'}`}
      style={{ borderStyle: 'dashed' }}>
      <div style={{ fontSize: compact ? 32 : 40, marginBottom: 12 }}>{icon}</div>
      <h3 className={`font-bold ss-ink mb-2 ${compact ? 'text-base' : 'text-lg'}`}>{title}</h3>
      <p className="text-sm ss-ink-dim max-w-md mx-auto mb-5 leading-relaxed">{description}</p>
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="ss-btn-primary inline-block px-5 py-2.5 text-sm no-underline">
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && onCtaClick && !ctaTo && (
        <button type="button" onClick={onCtaClick} className="ss-btn-primary px-5 py-2.5 text-sm">
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
