// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Suspense, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Html } from '@react-three/drei'
import { X } from 'lucide-react'
import type { ThreeEvent } from '@react-three/fiber'
import { useSettings } from '../../features/Settings/Settings'
import { formatPrice, formatArea } from '../../utils/format'
import styles from './Model3DViewer.module.scss'

interface ApartmentData {
  id: number
  name: string
  bedrooms: number
  bathrooms: number
  area: number
  price: number
  floor: number
}

const apartmentsData: Record<number, ApartmentData> = {
  1: {
    id: 1,
    name: 'Apartment 1A',
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    price: 1_800_000,
    floor: 1,
  },
  3: {
    id: 3,
    name: 'Apartment 2B',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    price: 2_500_000,
    floor: 2,
  },
  5: {
    id: 5,
    name: 'Apartment 3C',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    price: 3_200_000,
    floor: 3,
  },
  7: {
    id: 7,
    name: 'Apartment 4D',
    bedrooms: 4,
    bathrooms: 3,
    area: 150,
    price: 4_500_000,
    floor: 4,
  },
}

// Простая модель здания (можно заменить на GLTF)
function BuildingModel({
  onApartmentHover,
  onApartmentClick,
  hoveredApartmentId,
  selectedApartmentId,
}: {
  onApartmentHover: (apartmentId: number | null) => void
  onApartmentClick: (apartmentId: number) => void
  hoveredApartmentId: number | null
  selectedApartmentId: number | null
}) {
  return (
    <group>
      {/* Основание здания */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.5, 8]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Основной корпус */}
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 8, 7]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>

      {/* Этажи с окнами */}
      {[1, 3, 5, 7].map((y, i) => {
        const apartmentId = y
        const isSelected = selectedApartmentId === apartmentId
        const isHovered = hoveredApartmentId === apartmentId && !isSelected
        // При выборе - очень желтый, при ховере - яркий золотой, иначе стандартный голубой
        const windowColor = isSelected ? '#ffff00' : isHovered ? '#ffd700' : '#87ceeb'
        const emissiveIntensity = isSelected ? 1.5 : isHovered ? 1.2 : 0.3

        return (
          <group key={i} position={[0, y, 0]}>
            {/* Окна на передней стороне */}
            {[-2, 0, 2].map((x, j) => (
              <mesh
                key={`front-${j}`}
                position={[x, 0, 3.51]}
                castShadow
                onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onApartmentHover(apartmentId)
                }}
                onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onApartmentHover(null)
                }}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation()
                  onApartmentClick(apartmentId)
                }}
              >
                <boxGeometry args={[1.5, 1.5, 0.1]} />
                <meshStandardMaterial
                  color={windowColor}
                  emissive={windowColor}
                  emissiveIntensity={emissiveIntensity}
                />
              </mesh>
            ))}
            {/* Окна на задней стороне */}
            {[-2, 0, 2].map((x, j) => (
              <mesh
                key={`back-${j}`}
                position={[x, 0, -3.51]}
                castShadow
                onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onApartmentHover(apartmentId)
                }}
                onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onApartmentHover(null)
                }}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation()
                  onApartmentClick(apartmentId)
                }}
              >
                <boxGeometry args={[1.5, 1.5, 0.1]} />
                <meshStandardMaterial
                  color={windowColor}
                  emissive={windowColor}
                  emissiveIntensity={emissiveIntensity}
                />
              </mesh>
            ))}
            {/* Окна на левой стороне */}
            {[-2, 0, 2].map((z, j) => (
              <mesh
                key={`left-${j}`}
                position={[-3.51, 0, z]}
                castShadow
                onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onApartmentHover(apartmentId)
                }}
                onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onApartmentHover(null)
                }}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation()
                  onApartmentClick(apartmentId)
                }}
              >
                <boxGeometry args={[0.1, 1.5, 1.5]} />
                <meshStandardMaterial
                  color={windowColor}
                  emissive={windowColor}
                  emissiveIntensity={emissiveIntensity}
                />
              </mesh>
            ))}
            {/* Окна на правой стороне */}
            {[-2, 0, 2].map((z, j) => (
              <mesh
                key={`right-${j}`}
                position={[3.51, 0, z]}
                castShadow
                onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onApartmentHover(apartmentId)
                }}
                onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onApartmentHover(null)
                }}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation()
                  onApartmentClick(apartmentId)
                }}
              >
                <boxGeometry args={[0.1, 1.5, 1.5]} />
                <meshStandardMaterial
                  color={windowColor}
                  emissive={windowColor}
                  emissiveIntensity={emissiveIntensity}
                />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Крыша */}
      <mesh position={[0, 8.5, 0]} castShadow>
        <boxGeometry args={[7.5, 1, 7.5]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Балконы */}
      {[2, 4, 6].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          {[-2.5, 0, 2.5].map((x, j) => (
            <mesh key={`balcony-${j}`} position={[x, -0.5, 3.5]} castShadow>
              <boxGeometry args={[2, 0.2, 0.5]} />
              <meshStandardMaterial color="#8b7355" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Scene({
  selectedApartmentId,
  onApartmentHover,
  onApartmentClick,
  onClosePopup,
  isMobile,
  hoveredApartmentId,
  currency,
  unit,
  labels,
}: {
  selectedApartmentId: number | null
  onApartmentHover: (apartmentId: number | null) => void
  onApartmentClick: (apartmentId: number) => void
  onClosePopup: () => void
  isMobile: boolean
  hoveredApartmentId: number | null
  currency: string
  unit: string
  labels: Record<string, string>
}) {
  const selectedApartment = selectedApartmentId ? apartmentsData[selectedApartmentId] : null

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      <BuildingModel
        onApartmentHover={onApartmentHover}
        onApartmentClick={onApartmentClick}
        hoveredApartmentId={hoveredApartmentId}
        selectedApartmentId={selectedApartmentId}
      />

      {selectedApartment && !isMobile && (
        <Html position={[0, selectedApartment.floor + 1.5, 0]} center>
          <div className={styles.apartmentPopup}>
            <button className={styles.popupCloseBtn} onClick={onClosePopup} aria-label="Close">
              <X size={16} />
            </button>
            <h4 className={styles.popupTitle}>{selectedApartment.name}</h4>
            <div className={styles.popupInfo}>
              <div className={styles.popupRow}>
                <span>{labels.floor}</span>
                <strong>{selectedApartment.floor}</strong>
              </div>
              <div className={styles.popupRow}>
                <span>{labels.bedrooms}</span>
                <strong>{selectedApartment.bedrooms}</strong>
              </div>
              <div className={styles.popupRow}>
                <span>{labels.bathrooms}</span>
                <strong>{selectedApartment.bathrooms}</strong>
              </div>
              <div className={styles.popupRow}>
                <span>{labels.area}</span>
                <strong>{formatArea(selectedApartment.area, unit)}</strong>
              </div>
              <div className={styles.popupRow}>
                <span>{labels.price}</span>
                <strong>{formatPrice(selectedApartment.price, currency)}</strong>
              </div>
            </div>
          </div>
        </Html>
      )}

      <PerspectiveCamera makeDefault position={[15, 10, 15]} fov={50} />
      <OrbitControls
        enablePan={false}
        minDistance={10}
        maxDistance={30}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />

      <Environment preset="sunset" />
    </>
  )
}

interface Model3DViewerProps {
  embedded?: boolean
}

export default function Model3DViewer({ embedded = false }: Model3DViewerProps) {
  const { t } = useTranslation()
  const { currency, unit } = useSettings()
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null)
  const [hoveredApartmentId, setHoveredApartmentId] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleApartmentHover = (apartmentId: number | null) => {
    setHoveredApartmentId(apartmentId)
    // Меняем курсор через CSS
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.style.cursor = apartmentId !== null ? 'pointer' : 'default'
    }
  }

  const handleApartmentClick = (apartmentId: number) => {
    if (selectedApartmentId === apartmentId) {
      handleClosePopup()
    } else {
      setIsClosing(false)
      setSelectedApartmentId(apartmentId)
    }
  }

  const handleClosePopup = () => {
    if (isMobile) {
      setIsClosing(true)
      setTimeout(() => {
        setSelectedApartmentId(null)
        setIsClosing(false)
      }, 300) // Длительность анимации закрытия
    } else {
      setSelectedApartmentId(null)
    }
  }

  const labels = {
    floor: t('model3d.floor'),
    bedrooms: t('model3d.bedrooms'),
    bathrooms: t('model3d.bathrooms'),
    area: t('model3d.area'),
    price: t('model3d.price'),
  }

  const selectedApartment = selectedApartmentId ? apartmentsData[selectedApartmentId] : null

  return (
    <div className={`${styles.container} ${embedded ? styles.embedded : ''}`}>
      {!embedded && (
        <div className={styles.header}>
          <h3 className={styles.title}>{t('model3d.title')}</h3>
          <p className={styles.subtitle}>{t('model3d.subtitle')}</p>
        </div>
      )}
      <div className={styles.canvasWrapper}>
        <Suspense fallback={<div className={styles.loading}>{t('model3d.loading')}</div>}>
          <Canvas shadows gl={{ antialias: true, alpha: true }}>
            <Scene
              selectedApartmentId={selectedApartmentId}
              onApartmentHover={handleApartmentHover}
              onApartmentClick={handleApartmentClick}
              onClosePopup={handleClosePopup}
              isMobile={isMobile}
              hoveredApartmentId={hoveredApartmentId}
              currency={currency}
              unit={unit}
              labels={labels}
            />
          </Canvas>
        </Suspense>
      </div>

      {selectedApartment && isMobile && (
        <div className={`${styles.mobilePopup} ${isClosing ? styles.closing : ''}`}>
          <button className={styles.popupCloseBtn} onClick={handleClosePopup} aria-label="Close">
            <X size={16} />
          </button>
          <h4 className={styles.popupTitle}>{selectedApartment.name}</h4>
          <div className={styles.popupInfo}>
            <div className={styles.popupRow}>
              <span>{t('model3d.floor')}</span>
              <strong>{selectedApartment.floor}</strong>
            </div>
            <div className={styles.popupRow}>
              <span>{t('model3d.bedrooms')}</span>
              <strong>{selectedApartment.bedrooms}</strong>
            </div>
            <div className={styles.popupRow}>
              <span>{t('model3d.bathrooms')}</span>
              <strong>{selectedApartment.bathrooms}</strong>
            </div>
            <div className={styles.popupRow}>
              <span>{t('model3d.area')}</span>
              <strong>{formatArea(selectedApartment.area, unit)}</strong>
            </div>
            <div className={styles.popupRow}>
              <span>{t('model3d.price')}</span>
              <strong>{formatPrice(selectedApartment.price, currency)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
