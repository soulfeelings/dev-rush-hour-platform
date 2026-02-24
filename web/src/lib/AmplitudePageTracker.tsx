import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from './amplitude'

export default function AmplitudePageTracker() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    trackEvent('Page Viewed', { path: pathname, search })
  }, [pathname, search])

  return null
}
