import { useState, useRef, useEffect } from 'react'
import styles from './ResizableSplitter.module.scss'

interface ResizableSplitterProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  initialLeftWidth?: number
  minLeftWidth?: number
  minRightWidth?: number
}

export default function ResizableSplitter({
  leftPanel,
  rightPanel,
  initialLeftWidth = 60,
  minLeftWidth = 30,
  minRightWidth = 20,
}: ResizableSplitterProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      const minLeft = minLeftWidth
      const maxLeft = 100 - minRightWidth

      if (newLeftWidth >= minLeft && newLeftWidth <= maxLeft) {
        setLeftWidth(newLeftWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, minLeftWidth, minRightWidth])

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.leftPanel} style={{ width: `${leftWidth}%` }}>
        {leftPanel}
      </div>
      <div
        className={styles.splitter}
        onMouseDown={() => setIsResizing(true)}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
      />
      <div className={styles.rightPanel} style={{ width: `${100 - leftWidth}%` }}>
        {rightPanel}
      </div>
    </div>
  )
}
