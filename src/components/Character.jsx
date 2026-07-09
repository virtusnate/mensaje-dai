import Lottie from 'lottie-react'
import { charXPercent } from '../lib/progress'
import placeholder from '../assets/lottie/placeholder.json'

const ANIMATIONS = {
  walk: placeholder,
  'sad-1': placeholder,
  'sad-2': placeholder,
  'sad-3': placeholder,
  'sad-4': placeholder,
  happy: placeholder,
  dead: placeholder,
}

export function Character({ emotion, p }) {
  const data = ANIMATIONS[emotion] ?? placeholder
  return (
    <div
      data-testid="character"
      className="absolute"
      style={{
        left: `${charXPercent(p)}%`,
        bottom: '20%',
        width: '72px',
        height: '110px',
        transform: 'translateX(-50%)',
        transition: 'left 700ms ease-out',
      }}
    >
      <Lottie animationData={data} loop data-emotion={emotion} aria-hidden="true" />
    </div>
  )
}
