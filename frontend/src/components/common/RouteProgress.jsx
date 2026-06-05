import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/** Sayfa geçişlerinde üstte kısa cyan ilerleme çubuğu */
export default function RouteProgress() {
  const location = useLocation()
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(true)
    const t = window.setTimeout(() => setActive(false), 220)
    return () => window.clearTimeout(t)
  }, [location.pathname])

  return (
    <div
      className={`route-progress${active ? ' route-progress--active' : ''}`}
      role="progressbar"
      aria-hidden="true"
    />
  )
}
