import type { Property } from '../../types/property'
import type { District } from '../../data/dubai_districts_data'

export const createDistrictPopupHTML = (district: District, properties: Property[]) => {
  const propertyCount = properties.filter(p => p.districtId === district.id).length

  return `
    <div class="marker-popup-content">
      <div class="marker-popup-image">
        <img src="${district.image}" alt="${district.name}" />
      </div>
      <div class="marker-popup-text">
        <div class="marker-popup-title">${district.name}</div>
        <div class="marker-popup-price">${propertyCount} объектов</div>
      </div>
    </div>
  `
}
