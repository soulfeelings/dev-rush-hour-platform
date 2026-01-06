import type { Property } from '../../../types/property'

export const createMarkerPopupHTML = (property: Property): string => {
  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  return `
    <div class="marker-popup-content">
      <div class="marker-popup-image">
        <img src="${escapeHtml(property.image)}" alt="${escapeHtml(property.title)}" />
      </div>
      <div class="marker-popup-text">
        <div class="marker-popup-title">${escapeHtml(property.title)}</div>
        <div class="marker-popup-price">${escapeHtml(property.developer)}</div>
      </div>
    </div>
  `
}
