import { useReducedMotion } from '../hooks/useReducedMotion'

const COUNT = { reading: 6, question: 9, burst: 18 }
const TINT = { reading: '#E8B4B8', question: '#F4C99A', burst: '#E8697F' }

export function Petals({ mode }) {
  const reduced = useReducedMotion()
  if (reduced) return null

  const n = COUNT[mode] ?? COUNT.reading
  const color = TINT[mode] ?? TINT.reading
  const dur = mode === 'burst' ? 2.2 : 6

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => {
        const left = (i * 37 + 11) % 100
        const delay = (i * 0.37) % dur
        const size = 4 + (i % 3) * 2
        return (
          <span
            key={i}
            data-testid="petal"
            style={{
              position: 'absolute',
              left: `${left}%`,
              bottom: '-8px',
              width: size,
              height: size,
              borderRadius: '60% 0 60% 0',
              background: color,
              opacity: 0.7,
              animation: `petal-rise ${dur}s linear ${delay}s infinite`,
            }}
          />
        )
      })}
    </div>
  )
}
