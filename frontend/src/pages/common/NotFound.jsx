import { Link } from 'react-router-dom'
import Logo from '../../components/common/Logo.jsx'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 app-shell">
      <Logo variant="lockup" size="lg" theme="dark" />
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold ss-ink mb-2">Sayfa bulunamadı</h1>
        <p className="text-sm ss-ink-dim mb-6">
          Aradığınız adres mevcut değil veya taşınmış olabilir.
        </p>
        <Link to="/" className="ss-btn-primary inline-block px-6 py-2.5 text-sm no-underline">
          Genel Bakış&apos;a dön
        </Link>
      </div>
    </div>
  )
}
