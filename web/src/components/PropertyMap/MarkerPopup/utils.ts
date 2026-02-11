import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import type { Property } from '../../../types/property'
import { SettingsProvider } from '../../../features/Settings/Settings'
import { MarkerPopup } from './MarkerPopup'

export const createMarkerPopupElement = (property: Property): HTMLElement => {
  const container = document.createElement('div')
  const root = createRoot(container)

  root.render(
    createElement(SettingsProvider, null, createElement(MarkerPopup, { property, direction: 'top' }))
  )

  return container
}
