// A little row of pixel flowers at the avatar's feet — used on the proposition and the
// follow-up question screens.
const FLOWERS = [
  { left: '14%', c: '#E8697F', h: 20 },
  { left: '28%', c: '#FBF3DE', h: 16 },
  { left: '40%', c: '#E8B4B8', h: 22 },
  { left: '60%', c: '#F4C36A', h: 18 },
  { left: '72%', c: '#E8697F', h: 22 },
  { left: '86%', c: '#E8B4B8', h: 16 },
]

function PixelFlower({ color, height }) {
  return (
    <svg width={height * 0.7} height={height} viewBox="0 0 6 8" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }} aria-hidden="true">
      <rect x="2" y="4" width="1" height="4" fill="#4A6B3E" />
      <rect x="2" y="1" width="1" height="1" fill={color} />
      <rect x="1" y="2" width="1" height="1" fill={color} />
      <rect x="3" y="2" width="1" height="1" fill={color} />
      <rect x="2" y="3" width="1" height="1" fill={color} />
      <rect x="2" y="2" width="1" height="1" fill="#F4C36A" />
    </svg>
  )
}

export function Flowers() {
  return (
    <div className="absolute inset-x-0" style={{ bottom: '46%' }} aria-hidden="true">
      {FLOWERS.map((f, i) => (
        <span key={i} className="absolute" style={{ left: f.left, bottom: 0 }}>
          <PixelFlower color={f.c} height={f.h} />
        </span>
      ))}
    </div>
  )
}
