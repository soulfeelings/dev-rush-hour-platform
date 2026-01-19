import type { Property } from '../../../types/property'
import './MarkerPopup.scss'

interface MarkerPopupProps {
  property: Property
}

export const MarkerPopup = ({ property }: MarkerPopupProps) => {
  return (
    <div className="marker-popup-content">
      <div className="marker-popup-image">
        <img src={property.image} alt={property.title} />
      </div>
      <div className="marker-popup-text">
        <p className="marker-popup-title">{property.title}</p>
        <p className="marker-popup-developer">{property.developer}</p>
        <div className="marker-popup-price-info">
          <p className="marker-price-regular">6 options are available now from</p>{' '}
          <p className="marker-price-medium">{property.priceFrom}</p>
        </div>
      </div>
    </div>
  )
}
