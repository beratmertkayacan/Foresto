import Logo from './Logo.jsx'

/** Oturum durumu çözülürken — route içeriği render edilmez */
export default function AuthResolvingScreen() {
  return (
    <div className="auth-resolving" aria-live="polite" aria-busy="true">
      <Logo variant="icon" size="md" theme="dark" decorative />
      <div className="auth-resolving__bar">
        <div className="auth-resolving__bar-fill" />
      </div>
    </div>
  )
}
