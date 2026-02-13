import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import type { Project } from '../../../api/generated/schemas/project'
import { MarkerPopup } from './MarkerPopup'

export const createMarkerPopupElement = (
  project: Project,
  currency: 'AED' | 'USD' = 'AED'
): HTMLElement => {
  const container = document.createElement('div')
  const root = createRoot(container)

  root.render(createElement(MarkerPopup, { project, direction: 'top', currency }))

  return container
}
