import { lerp } from '../lib/progress'

// Pixel-art sprite. It rises bottom→top through the scene as the story advances (via `p`) and
// otherwise stays perfectly still — no idle bob. A little heart it carries pulses very slowly.
// Emotion tweaks pose/tint; `dead` topples the figure and drops the heart.
const SKIN = '#F0C39B'
const HAIR = '#4A2E24'
const DRESS = '#C86B7A' // soft romantic rose
const DRESS2 = '#A85466'
const HEART = '#E0566E'
const INK = '#2C1A0E'

function PixelHeart({ x, y }) {
  return (
    <g className="heart-pulse">
      <rect x={x} y={y} width="1" height="1" fill={HEART} />
      <rect x={x + 2} y={y} width="1" height="1" fill={HEART} />
      <rect x={x - 1} y={y + 1} width="5" height="1" fill={HEART} />
      <rect x={x} y={y + 2} width="3" height="1" fill={HEART} />
      <rect x={x + 1} y={y + 3} width="1" height="1" fill={HEART} />
    </g>
  )
}

export function Character({ emotion, p }) {
  const sad = String(emotion).startsWith('sad')
  const dead = emotion === 'dead'
  const happy = emotion === 'happy'
  const showHeart = !sad && !dead

  return (
    <div
      data-testid="character"
      data-emotion={emotion}
      className="absolute"
      style={{
        left: '50%',
        bottom: `${lerp(44, 74, p)}%`,
        width: 46,
        height: 64,
        transform: 'translateX(-50%)',
        transition: 'bottom 900ms ease-out, opacity 900ms ease-out',
        opacity: dead ? 0.5 : sad ? 0.85 : 1,
        filter: sad || dead ? 'saturate(0.55)' : 'none',
      }}
      aria-hidden="true"
    >
      <div
        className={happy ? 'sprite-sway' : ''}
        style={{
          width: '100%',
          height: '100%',
          transform: dead ? 'rotate(90deg)' : 'none',
          transformOrigin: 'center bottom',
          transition: 'transform 600ms ease-out',
        }}
      >
        <svg viewBox="0 0 12 16" width="100%" height="100%" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
          {/* long hair */}
          <rect x="3" y="0" width="6" height="2" fill={HAIR} />
          <rect x="3" y="2" width="1" height="4" fill={HAIR} />
          <rect x="8" y="2" width="1" height="4" fill={HAIR} />
          {/* head */}
          <rect x="4" y="1" width="4" height="3" fill={SKIN} />
          {/* eyes (drop a row when sad) */}
          <rect x="5" y={sad || dead ? 3 : 2} width="1" height="1" fill={INK} />
          <rect x="7" y={sad || dead ? 3 : 2} width="1" height="1" fill={INK} />
          {/* dress body (flares at the hem) */}
          <rect x="4" y="4" width="4" height="4" fill={DRESS} />
          <rect x="3" y="8" width="6" height="3" fill={DRESS} />
          <rect x="3" y="10" width="6" height="1" fill={DRESS2} />
          {/* arms — raised when happy, else at sides */}
          {happy ? (
            <>
              <rect x="2" y="2" width="1" height="3" fill={SKIN} />
              <rect x="9" y="2" width="1" height="3" fill={SKIN} />
            </>
          ) : (
            <>
              <rect x="3" y="4" width="1" height="3" fill={SKIN} />
              <rect x="8" y="4" width="1" height="3" fill={SKIN} />
            </>
          )}
          {/* legs + feet */}
          <rect x="4" y="11" width="1" height="3" fill={SKIN} />
          <rect x="7" y="11" width="1" height="3" fill={SKIN} />
          <rect x="4" y="14" width="1" height="1" fill={INK} />
          <rect x="7" y="14" width="1" height="1" fill={INK} />
          {/* the heart she carries */}
          {showHeart && <PixelHeart x={happy ? 9 : 8} y={happy ? 1 : 3} />}
        </svg>
      </div>
    </div>
  )
}
