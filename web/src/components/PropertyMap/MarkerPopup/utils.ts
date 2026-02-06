import { createRoot, type Root } from 'react-dom/client'
import { createElement } from 'react'
import type { Property } from '../../../types/property'
import { MarkerPopup } from './MarkerPopup'

interface PopupEventHandlers {
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const createMarkerPopupElement = (
  property: Property,
  handlers?: PopupEventHandlers
): HTMLElement => {
  const container = document.createElement('div')
  const root = createRoot(container)
  root.render(
    createElement(MarkerPopup, {
      property,
      onMouseEnter: handlers?.onMouseEnter,
      onMouseLeave: handlers?.onMouseLeave,
    })
  )

  // Сохраняем root в контейнере для последующей очистки
  ;(container as unknown as { _reactRoot?: Root })._reactRoot = root

  return container
}

export const cleanupMarkerPopupElement = (element: HTMLElement): void => {
  const root = (element as unknown as { _reactRoot?: Root })._reactRoot
  if (root) {
    root.unmount()
    delete (element as unknown as { _reactRoot?: Root })._reactRoot
  }
}
