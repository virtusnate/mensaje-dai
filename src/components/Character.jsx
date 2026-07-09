import Lottie from 'lottie-react'
import { charXPercent } from '../lib/progress'
import { CHARACTER } from '../assets/lottie'
import placeholder from '../assets/lottie/placeholder.json'

export function Character({ emotion, p }) {
  const data = CHARACTER[emotion] ?? placeholder
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
