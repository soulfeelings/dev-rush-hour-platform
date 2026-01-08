import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Html } from '@react-three/drei'
import { X } from 'lucide-react'
import styles from './Model3DViewer.module.scss'

// Простая модель здания (можно заменить на GLTF)
function BuildingModel({
  onApartmentHover,
  onApartmentClick,
}: {
  onApartmentHover: (hovered: boolean) => void
  onApartmentClick: () => void
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
        const isHighlighted = y === 5 // Выделяем квартиру на среднем этаже
        const windowColor = isHighlighted ? '#e5a732' : '#87ceeb'
        const emissiveIntensity = isHighlighted ? 0.8 : 0.3

        return (
          <group key={i} position={[0, y, 0]}>
            {/* Окна на передней стороне */}
            {[-2, 0, 2].map((x, j) => (
              <mesh
                key={`front-${j}`}
                position={[x, 0, 3.51]}
                castShadow
                onPointerOver={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentHover(true)
                      }
                    : undefined
                }
                onPointerOut={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentHover(false)
                      }
                    : undefined
                }
                onClick={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentClick()
                      }
                    : undefined
                }
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
                onPointerOver={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentHover(true)
                      }
                    : undefined
                }
                onPointerOut={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentHover(false)
                      }
                    : undefined
                }
                onClick={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentClick()
                      }
                    : undefined
                }
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
                onPointerOver={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentHover(true)
                      }
                    : undefined
                }
                onPointerOut={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentHover(false)
                      }
                    : undefined
                }
                onClick={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentClick()
                      }
                    : undefined
                }
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
                onPointerOver={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentHover(true)
                      }
                    : undefined
                }
                onPointerOut={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentHover(false)
                      }
                    : undefined
                }
                onClick={
                  isHighlighted
                    ? e => {
                        e.stopPropagation()
                        onApartmentClick()
                      }
                    : undefined
                }
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
  showPopup,
  onApartmentHover,
  onApartmentClick,
  onClosePopup,
  isMobile,
}: {
  showPopup: boolean
  onApartmentHover: (hovered: boolean) => void
  onApartmentClick: () => void
  onClosePopup: () => void
  isMobile: boolean
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      <BuildingModel onApartmentHover={onApartmentHover} onApartmentClick={onApartmentClick} />

      {showPopup && !isMobile && (
        <Html position={[0, 6.5, 0]} center>
          <div className={styles.apartmentPopup}>
            <button className={styles.popupCloseBtn} onClick={onClosePopup} aria-label="Close">
              <X size={16} />
            </button>
            <h4 className={styles.popupTitle}>Apartment 3B</h4>
            <div className={styles.popupInfo}>
              <div className={styles.popupRow}>
                <span>Bedrooms:</span>
                <strong>2</strong>
              </div>
              <div className={styles.popupRow}>
                <span>Bathrooms:</span>
                <strong>2</strong>
              </div>
              <div className={styles.popupRow}>
                <span>Area:</span>
                <strong>85 sqm</strong>
              </div>
              <div className={styles.popupRow}>
                <span>Price:</span>
                <strong>2.5M AED</strong>
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
  const [showPopup, setShowPopup] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
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

  const handleApartmentHover = (hovered: boolean) => {
    setIsHovered(hovered)
    // Меняем курсор через CSS
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.style.cursor = hovered ? 'pointer' : 'default'
    }
  }

  const handleApartmentClick = () => {
    if (showPopup) {
      handleClosePopup()
    } else {
      setIsClosing(false)
      setShowPopup(true)
    }
  }

  const handleClosePopup = () => {
    if (isMobile) {
      setIsClosing(true)
      setTimeout(() => {
        setShowPopup(false)
        setIsClosing(false)
      }, 300) // Длительность анимации закрытия
    } else {
      setShowPopup(false)
    }
  }

  return (
    <div className={`${styles.container} ${embedded ? styles.embedded : ''}`}>
      {!embedded && (
        <div className={styles.header}>
          <h3 className={styles.title}>3D Model</h3>
          <p className={styles.subtitle}>Drag to rotate, scroll to zoom</p>
        </div>
      )}
      <div className={styles.canvasWrapper}>
        <Suspense fallback={<div className={styles.loading}>Loading 3D model...</div>}>
          <Canvas shadows gl={{ antialias: true, alpha: true }}>
            <Scene
              showPopup={showPopup || isHovered}
              onApartmentHover={handleApartmentHover}
              onApartmentClick={handleApartmentClick}
              onClosePopup={handleClosePopup}
              isMobile={isMobile}
            />
          </Canvas>
        </Suspense>
      </div>

      {showPopup && isMobile && (
        <div className={`${styles.mobilePopup} ${isClosing ? styles.closing : ''}`}>
          <button className={styles.popupCloseBtn} onClick={handleClosePopup} aria-label="Close">
            <X size={16} />
          </button>
          <h4 className={styles.popupTitle}>Apartment 3B</h4>
          <div className={styles.popupInfo}>
            <div className={styles.popupRow}>
              <span>Bedrooms:</span>
              <strong>2</strong>
            </div>
            <div className={styles.popupRow}>
              <span>Bathrooms:</span>
              <strong>2</strong>
            </div>
            <div className={styles.popupRow}>
              <span>Area:</span>
              <strong>85 sqm</strong>
            </div>
            <div className={styles.popupRow}>
              <span>Price:</span>
              <strong>2.5M AED</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
