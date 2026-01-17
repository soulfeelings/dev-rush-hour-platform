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
        <p className="marker-popup-price">{property.developer}</p>
      </div>
    </div>
  )
}
