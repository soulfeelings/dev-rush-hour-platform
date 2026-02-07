import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import type { Property } from '../../../types/property'
import { MarkerPopup } from './MarkerPopup'

type PopupDirection = 'bottom' | 'left' | 'right' | 'top'

export interface MarkerPopupHandle {
  element: HTMLElement
  setDirection: (direction: PopupDirection) => void
  cleanup: () => void
}

export const createMarkerPopupElement = (property: Property): MarkerPopupHandle => {
  const container = document.createElement('div')
  const root = createRoot(container)

  let currentDirection: PopupDirection = 'top'

  const render = () => {
    root.render(
      createElement(MarkerPopup, {
        property,
        direction: currentDirection,
      })
    )
  }

  render()

  return {
    element: container,
    setDirection: (direction: PopupDirection) => {
      currentDirection = direction
      render()
    },
    cleanup: () => root.unmount(),
  }
}
