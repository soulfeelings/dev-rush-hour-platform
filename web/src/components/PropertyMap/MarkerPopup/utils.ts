import type { Property } from '../../../data/mockProperties'

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
        <p class="marker-popup-title">${escapeHtml(property.title)}</p>
        <p class="marker-popup-developer">${escapeHtml(property.developer)}</p>
      </div>
    </div>
  `
}

