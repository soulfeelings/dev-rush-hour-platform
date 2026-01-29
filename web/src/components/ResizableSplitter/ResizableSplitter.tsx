import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './ResizableSplitter.module.scss'

interface ResizableSplitterProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  initialLeftWidth?: number
  minLeftWidth?: number
  minRightWidth?: number
  onWidthChange?: (width: number) => void
  onFinishResizing?: (width: number) => void
}

export default function ResizableSplitter({
  leftPanel,
  rightPanel,
  initialLeftWidth = 60,
  minLeftWidth = 30,
  minRightWidth = 20,
  onWidthChange,
  onFinishResizing,
}: ResizableSplitterProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const splitterRef = useRef<HTMLDivElement>(null)
  const currentWidthRef = useRef(initialLeftWidth)
  const onWidthChangeRef = useRef(onWidthChange)
  const onFinishResizingRef = useRef(onFinishResizing)

  useEffect(() => {
    onWidthChangeRef.current = onWidthChange
  }, [onWidthChange])

  useEffect(() => {
    onFinishResizingRef.current = onFinishResizing
  }, [onFinishResizing])

  useEffect(() => {
    if (!isResizing) {
      setLeftWidth(initialLeftWidth)
      currentWidthRef.current = initialLeftWidth
    }
  }, [initialLeftWidth])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    splitterRef.current?.setPointerCapture(e.pointerId)
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      const minLeft = minLeftWidth
      const maxLeft = 100 - minRightWidth

      if (newLeftWidth >= minLeft && newLeftWidth <= maxLeft) {
        setLeftWidth(newLeftWidth)
        currentWidthRef.current = newLeftWidth
        onWidthChangeRef.current?.(newLeftWidth)
      }
    },
    [isResizing, minLeftWidth, minRightWidth]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    splitterRef.current?.releasePointerCapture(e.pointerId)
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    onFinishResizingRef.current?.(currentWidthRef.current)
  }, [])

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.leftPanel} style={{ width: `${leftWidth}%` }}>
        {leftPanel}
      </div>
      <div
        ref={splitterRef}
        className={`${styles.splitter} ${isResizing ? styles.isResizing : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
