import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import type { Property } from '../../../types/property'
import { MarkerPopup } from './MarkerPopup'

export const createMarkerPopupElement = (
  property: Property,
  currency: 'AED' | 'USD' = 'AED'
): HTMLElement => {
  const container = document.createElement('div')
  const root = createRoot(container)

  root.render(createElement(MarkerPopup, { property, direction: 'top', currency }))

  return container
}
