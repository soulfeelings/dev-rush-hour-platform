import { useState } from 'react'
import {
  Dumbbell,
  Waves,
  Eye,
  Sparkles,
  Baby,
  Zap,
  Shield,
  Car,
  ConciergeBell,
  Umbrella,
  Trees,
  ChefHat,
  Store,
  ShoppingCart,
  Table,
  Trophy,
  Bike,
  Package,
  Flower2,
  Anchor,
  UtensilsCrossed,
  Users,
  Building2,
  BookOpen,
  Film,
  Presentation,
  ShoppingBag,
  Flame,
} from 'lucide-react'
import styles from './ProjectFeatures.module.scss'

interface ProjectFeaturesProps {
  features: string[]
  maxItems?: number
}

// Маппинг названий features на иконки
const featureIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Gym: Dumbbell,
  'Swimming Pool': Waves,
  'Sea View': Eye,
  'Spa Center': Sparkles,
  "Children's Playground": Baby,
  'Electric Vehicle Charging': Zap,
  '24/7 Security': Shield,
  'Underground Parking': Car,
  'Concierge Service': ConciergeBell,
  'Private Beach': Umbrella,
  'Landscaped Garden': Trees,
  'Barbecue Area': ChefHat,
  'Retail Space': Store,
  'On-site Supermarket': ShoppingCart,
  'Picnic Area': Table,
  'Sports Court': Trophy,
  'Bicycle Paths': Bike,
  'Package Room': Package,
  'Yoga Studio': Flower2,
  'Kids Club': Users,
  'Private Yacht Dock': Anchor,
  'On-site Restaurant': UtensilsCrossed,
  'Infrared Saunas': Flame,
  'Poolside Restaurant': UtensilsCrossed,
  'Kids Club with Nanny': Users,
  Helipad: Building2,
  'Indoor Tennis Court': Trophy,
  Library: BookOpen,
  Cinema: Film,
  'Conference Room': Presentation,
  'Direct Access to Dubai Mall': ShoppingBag,
}

// Функция для получения иконки по названию feature
const getFeatureIcon = (feature: string) => {
  return featureIconMap[feature] || Package
}

export default function ProjectFeatures({ features, maxItems = 6 }: ProjectFeaturesProps) {
  const [showAll, setShowAll] = useState(false)

  if (!features || features.length === 0) {
    return null
  }

  const displayedFeatures = showAll ? features : features.slice(0, maxItems)
  const hasMore = features.length > maxItems

  return (
    <div className={styles.featuresContainer}>
      <h3 className={styles.title}>Features & Amenities</h3>
      <div className={styles.featuresGrid}>
        {displayedFeatures.map((feature, index) => {
          const Icon = getFeatureIcon(feature)
          return (
            <div key={`${feature}-${index}`} className={styles.featureItem}>
              <div className={styles.iconWrapper}>
                <Icon size={20} className={styles.icon} />
              </div>
              <span className={styles.featureText}>{feature}</span>
            </div>
          )
        })}
      </div>
      {hasMore && (
        <button
          type="button"
          className={styles.showMoreButton}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : `Show ${features.length - maxItems} More`}
        </button>
      )}
    </div>
  )
}
