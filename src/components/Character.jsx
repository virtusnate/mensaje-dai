import { charXPercent } from '../lib/progress'

// Pixel-art videogame sprite, drawn as crisp SVG "pixels" so it stays sharp at any size and
// needs no external asset. Motion is deliberately subtle (a gentle bob) so it supports the
// text rather than competing with it. Emotion tweaks pose/tint; `dead` topples the figure.
const SKIN = '#F0C39B'
const HAIR = '#5A3A2E'
const SHIRT = '#C86B5A'
const PANTS = '#3E3355'
const INK = '#2C1A0E'

const ANIM = { walk: 'sprite-walk', happy: 'sprite-bounce' }

export function Character({ emotion, p }) {
  const sad = String(emotion).startsWith('sad')
  const dead = emotion === 'dead'
  const happy = emotion === 'happy'
  const anim = ANIM[emotion] ?? ''

  return (
    <div
      data-testid="character"
      data-emotion={emotion}
      className="absolute"
      style={{
        left: `${charXPercent(p)}%`,
        bottom: '46%',
        width: 54,
        height: 72,
        transform: 'translateX(-50%)',
        transition: 'left 700ms ease-out, opacity 700ms ease-out',
        opacity: dead ? 0.5 : sad ? 0.85 : 1,
        filter: sad || dead ? 'saturate(0.6)' : 'none',
      }}
      aria-hidden="true"
    >
      <div
        className={anim}
        style={{
          width: '100%',
          height: '100%',
          transform: dead ? 'rotate(90deg)' : 'none',
          transformOrigin: 'center bottom',
          transition: 'transform 500ms ease-out',
        }}
      >
        <svg
          viewBox="0 0 12 16"
          width="100%"
          height="100%"
          shapeRendering="crispEdges"
          style={{ imageRendering: 'pixelated', display: 'block' }}
        >
          {/* hair */}
          <rect x="4" y="0" width="4" height="1" fill={HAIR} />
          <rect x="3" y="1" width="1" height="2" fill={HAIR} />
          <rect x="8" y="1" width="1" height="2" fill={HAIR} />
          {/* head */}
          <rect x="4" y="1" width="4" height="3" fill={SKIN} />
          {/* eyes — drop a row when sad */}
          <rect x="5" y={sad || dead ? 3 : 2} width="1" height="1" fill={INK} />
          <rect x="7" y={sad || dead ? 3 : 2} width="1" height="1" fill={INK} />
          {/* body */}
          <rect x="4" y="4" width="4" height="5" fill={SHIRT} />
          {/* arms — raised when happy, otherwise at the sides */}
          {happy ? (
            <>
              <rect x="2" y="2" width="1" height="3" fill={SKIN} />
              <rect x="9" y="2" width="1" height="3" fill={SKIN} />
            </>
          ) : (
            <>
              <rect x="3" y="4" width="1" height="4" fill={SKIN} />
              <rect x="8" y="4" width="1" height="4" fill={SKIN} />
            </>
          )}
          {/* legs */}
          <rect x="4" y="9" width="1" height="4" fill={PANTS} />
          <rect x="7" y="9" width="1" height="4" fill={PANTS} />
          {/* feet */}
          <rect x="4" y="13" width="2" height="1" fill={INK} />
          <rect x="6" y="13" width="2" height="1" fill={INK} />
        </svg>
      </div>
    </div>
  )
}
