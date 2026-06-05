import AppBackdrop from './AppBackdrop.jsx'
import RouteProgress from '../common/RouteProgress.jsx'

/** Kalıcı atmosferik arka plan + üst geçiş çubuğu — route değişiminde unmount olmaz */
export default function AppChrome({ children }) {
  return (
    <>
      <AppBackdrop />
      <RouteProgress />
      <div className="app-content-layer">
        {children}
      </div>
    </>
  )
}
