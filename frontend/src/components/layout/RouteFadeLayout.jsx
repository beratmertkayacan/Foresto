import { useOutlet, useLocation } from 'react-router-dom'

/** Route outlet — ~180ms fade-in */
export default function RouteFadeLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div key={location.pathname} className="route-view">
      {outlet}
    </div>
  )
}
