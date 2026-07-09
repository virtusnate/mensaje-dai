// Closing beat: a pixel floral bloom (no Lottie) + the closing line.
const PETAL = ['#E8697F', '#FBF3DE', '#F4C36A', '#E8B4B8']

export function FloralFinale() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <svg width="120" height="120" viewBox="0 0 12 12" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }} aria-hidden="true" className="sprite-sway">
        <rect x="5" y="5" width="2" height="2" fill="#F4C36A" />
        <rect x="5" y="2" width="2" height="2" fill={PETAL[0]} />
        <rect x="5" y="8" width="2" height="2" fill={PETAL[3]} />
        <rect x="2" y="5" width="2" height="2" fill={PETAL[1]} />
        <rect x="8" y="5" width="2" height="2" fill={PETAL[2]} />
      </svg>
      <p className="font-body text-3xl italic mt-6 max-w-sm" style={{ color: 'var(--sepia)' }}>
        Paso por ti a tu casita y de ahí nos vamos juntos 🌸
      </p>
    </div>
  )
}
