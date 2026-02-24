import * as amplitude from '@amplitude/unified'

const API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY as string | undefined

export function initAmplitude() {
  if (!API_KEY) {
    console.warn('[Amplitude] VITE_AMPLITUDE_API_KEY is not set — skipping init')
    return
  }

  amplitude.initAll(API_KEY, {
    serverZone: 'EU',
    analytics: {
      autocapture: {
        attribution: true,
        fileDownloads: true,
        formInteractions: true,
        pageViews: true,
        sessions: true,
        elementInteractions: true,
        networkTracking: true,
        webVitals: true,
        frustrationInteractions: {
          thrashedCursor: true,
          errorClicks: true,
          deadClicks: true,
          rageClicks: true,
        },
      },
    },
    sessionReplay: { sampleRate: 1 },
  })
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!API_KEY) return
  amplitude.track(name, properties)
}
