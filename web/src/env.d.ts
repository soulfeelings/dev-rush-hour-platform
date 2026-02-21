/// <reference types="vite/client" />
/// <reference types="@react-three/fiber" />

declare module '*.svg?react' {
  import type { FC, SVGProps } from 'react'
  const content: FC<SVGProps<SVGSVGElement>>
  export default content
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}
