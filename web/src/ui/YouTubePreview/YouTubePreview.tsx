import { useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import styles from './YouTubePreview.module.scss'

export interface YouTubePreviewProps {
  url: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^&?/]+)/)
  return match?.[1] || null
}

export const YouTubePreview = ({ url, size = 'medium', className }: YouTubePreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoId = getYouTubeVideoId(url)

  // Reset playing state when URL changes
  useEffect(() => {
    setIsPlaying(false)
  }, [url])

  if (!videoId) return null

  if (isPlaying) {
    return (
      <div className={`${styles.player} ${styles[size]} ${className ?? ''}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div
      className={`${styles.preview} ${styles[size]} ${className ?? ''}`}
      onClick={() => setIsPlaying(true)}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt="YouTube video preview"
        onError={e => {
          // Fallback to medium quality if maxres is not available
          e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        }}
      />
      <div className={styles.playButton}>
        <Play size={32} fill="white" />
      </div>
    </div>
  )
}
