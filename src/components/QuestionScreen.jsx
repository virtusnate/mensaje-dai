import { Character } from './Character'
import { Bloom } from './Bloom'

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

export function QuestionScreen({ onYes, onNo }) {
  return (
    <div className="absolute inset-0 text-center">
      <Bloom intensity={0.7} />
      {/* Avatar arrives here for the first time, above the card */}
      <Character emotion="walk" bottom="58%" scale={1.45} />
      {/* Flowers for the proposition — a little meadow at his feet */}
      <div className="absolute inset-x-0" style={{ bottom: '46%' }} aria-hidden="true">
        {FLOWERS.map((f, i) => (
          <span key={i} className="absolute" style={{ left: f.left, bottom: 0 }}>
            <PixelFlower color={f.c} height={f.h} />
          </span>
        ))}
      </div>
      <div
        className="absolute left-0 right-0 bottom-0 px-6 pt-7 pb-9 rounded-t-3xl z-10"
        style={{
          minHeight: '44%',
          background: 'linear-gradient(180deg,#FDF7E6,#F3E4C6)',
          borderTop: '2px solid rgba(212,165,116,0.7)',
          boxShadow: '0 -10px 40px rgba(44,26,14,0.3)',
          color: 'var(--sepia)',
          animation: 'fade-rise 700ms ease-out both',
        }}
      >
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
            <span style={{ width: 26, height: 1, background: '#C86B5A' }} />
            <span style={{ color: '#C86B5A', fontSize: 12 }}>✿</span>
            <span style={{ width: 26, height: 1, background: '#C86B5A' }} />
          </div>
          <h1 className="font-body text-3xl md:text-4xl italic leading-snug mb-8">
            ¿Quieres salir conmigo una vez más a la cineteca de Chapultepec?
          </h1>
          <div className="flex gap-5 items-center justify-center">
            <button onClick={onYes} className="px-8 py-3 rounded-full text-white font-body text-lg" style={{ background: 'var(--coral)', minHeight: '44px' }}>Sí</button>
            <button onClick={onNo} className="px-8 py-3 rounded-full text-white font-body text-lg" style={{ background: 'var(--muted-rose)', minHeight: '44px' }}>No</button>
          </div>
        </div>
      </div>
    </div>
  )
}
