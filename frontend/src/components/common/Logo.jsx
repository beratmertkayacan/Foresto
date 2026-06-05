import { useId } from 'react'

const ICON_PX = { xs: 22, sm: 28, md: 32, lg: 40, xl: 48, '2xl': 56, '3xl': 64, '4xl': 72, '5xl': 80 }
const WORD_PX = { xs: 14, sm: 16, md: 18, lg: 22, xl: 26, '2xl': 32, '3xl': 38, '4xl': 42, '5xl': 46 }

const COLORS = {
  ore: '#EEF4FF',
  sto: '#34D3FF',
}

/** Birebir marka ikonu — gradient id çakışması için useId */
function ForestoIcon({ sizePx, theme = 'dark', className = '', decorative = false }) {
  const uid = useId().replace(/:/g, '')
  const gradId = `fg-${uid}`
  const a11y = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': 'Foresto' }

  if (theme === 'white') {
    return (
      <svg
        viewBox="0 0 120 120"
        width={sizePx}
        height={sizePx}
        className={`shrink-0 ${className}`}
        {...a11y}
      >
        <title>Foresto</title>
        <rect x="34" y="33" width="13" height="59" rx="6.5" fill={COLORS.ore} />
        <rect x="44" y="54" width="31" height="13" rx="6.5" fill={COLORS.ore} />
        <path
          d="M40 36 L55 43 L69 31 L85 37 L105 18"
          fill="none"
          stroke={COLORS.ore}
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="105" cy="18" r="11" fill="none" stroke="rgba(238,244,255,0.35)" strokeWidth="6" />
        <circle cx="105" cy="18" r="5.5" fill={COLORS.ore} />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 120 120"
      width={sizePx}
      height={sizePx}
      className={`shrink-0 ${className}`}
      {...a11y}
    >
      <title>Foresto</title>
      <defs>
        <linearGradient id={gradId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2ee6c4" />
          <stop offset="1" stopColor="#34d3ff" />
        </linearGradient>
      </defs>
      <rect x="34" y="33" width="13" height="59" rx="6.5" fill={`url(#${gradId})`} />
      <rect x="44" y="54" width="31" height="13" rx="6.5" fill="#2ee6c4" />
      <path
        d="M40 36 L55 43 L69 31 L85 37 L105 18"
        fill="none"
        stroke="#34d3ff"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="105" cy="18" r="11" fill="none" stroke="rgba(52,211,255,0.28)" strokeWidth="6" />
      <circle cx="105" cy="18" r="5.5" fill="#34d3ff" />
    </svg>
  )
}

function Wordmark({ size, className = '' }) {
  const fontSize = WORD_PX[size] || WORD_PX.md
  return (
    <span
      className={`inline-flex items-baseline font-bold leading-none tracking-tight ${className}`}
      style={{
        fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
        fontSize,
        letterSpacing: '-0.04em',
      }}
      aria-hidden="true"
    >
      <span style={{ color: COLORS.ore }}>ore</span>
      <span style={{ color: COLORS.sto }}>sto</span>
    </span>
  )
}

/**
 * Foresto marka logosu
 * @param {'lockup'|'icon'} variant — lockup: ikon + "oresto"; icon: yalnız ikon
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl'|'5xl'} size
 * @param {'dark'|'light'|'white'} theme — ikon renk modu (light = dark ile aynı gradient)
 * @param {boolean} tagline — lockup altında "Akıllı Envanter Yönetim Sistemi"
 * @param {boolean} decorative — ekran okuyucuda ikonu gizle (yanında Foresto metni varsa)
 */
export default function Logo({
  variant = 'lockup',
  size = 'md',
  theme = 'dark',
  tagline = false,
  decorative = false,
  className = '',
  onClick,
}) {
  const iconPx = ICON_PX[size] || ICON_PX.md
  const resolvedTheme = theme === 'light' ? 'dark' : theme
  const Wrapper = onClick ? 'button' : 'div'
  const wrapperProps = onClick
    ? { type: 'button', onClick, className: 'border-0 bg-transparent p-0 cursor-pointer' }
    : {}

  if (variant === 'icon') {
    return (
      <Wrapper
        {...wrapperProps}
        className={`inline-flex ${className}`}
        aria-label={decorative ? undefined : 'Foresto'}
        aria-hidden={decorative || undefined}
      >
        <ForestoIcon sizePx={iconPx} theme={resolvedTheme} decorative={decorative} />
      </Wrapper>
    )
  }

  return (
    <Wrapper
      {...wrapperProps}
      className={`inline-flex flex-col ${className}`}
      aria-label={decorative ? undefined : 'Foresto'}
      aria-hidden={decorative || undefined}
    >
      <span className="inline-flex items-center gap-2.5" aria-hidden="true">
        <ForestoIcon sizePx={iconPx} theme={resolvedTheme} decorative />
        <Wordmark size={size} />
      </span>
      {tagline && (
        <span
          className="mt-1 text-[10px] font-medium tracking-wide"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Akıllı Envanter Yönetim Sistemi
        </span>
      )}
    </Wrapper>
  )
}
