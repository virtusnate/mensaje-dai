import Lottie from 'lottie-react'
import placeholder from '../assets/lottie/placeholder.json'

export function HeartFinale() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <div style={{ width: 160, height: 160 }}>
        <Lottie animationData={placeholder} loop aria-hidden="true" />
      </div>
      <p className="font-script text-3xl mt-6 max-w-sm" style={{ color: 'var(--sepia)' }}>
        Paso por ti a tu casita y de ahí nos vamos juntos 💛
      </p>
    </div>
  )
}
