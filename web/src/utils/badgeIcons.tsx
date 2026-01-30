import type { ReactNode } from 'react'
import { Gift, Sofa, Tag, Stamp, Waves, Anchor, Sparkles, Key } from 'lucide-react'

// Map icon names from backend to lucide-react components
export const badgeIconMap: Record<string, ReactNode> = {
  gift: <Gift size={14} />,
  sofa: <Sofa size={14} />,
  tag: <Tag size={14} />,
  passport: <Stamp size={14} />,
  waves: <Waves size={14} />,
  anchor: <Anchor size={14} />,
  sparkles: <Sparkles size={14} />,
  key: <Key size={14} />,
}

export const getBadgeIcon = (iconName?: string): ReactNode | undefined => {
  if (!iconName) return undefined
  return badgeIconMap[iconName]
}
