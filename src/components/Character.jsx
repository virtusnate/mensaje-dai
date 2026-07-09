// Pixel-art man who offers a bouquet. Grounded + centered; subtle breathing while idle
// (no walk cycle, no bob). Emotion drives pose/tint and the bouquet's state. `dead` topples him.
const SKIN = '#F0C39B'
const HAIR = '#3A2A20'
const SHIRT = '#456B86'
const PANTS = '#33324A'
const INK = '#2C1A0E'
const STEM = '#4A6B3E'

function Bouquet({ state }) {
  const tops = state === 'wilt'
    ? ['#7A6A72', '#6A6458', '#7A6A72']
    : ['#E8697F', '#FBF3DE', '#F4C36A']
  const y = state === 'wilt' ? 6 : state === 'open' ? 3 : 4
  return (
    <g data-testid="bouquet">
      <rect x="5" y="7" width="1" height="3" fill={STEM} />
      <rect x="6" y="7" width="1" height="3" fill={STEM} />
      <rect x="4" y={y} width="1" height="1" fill={tops[0]} />
      <rect x="6" y={y - 1} width="1" height="1" fill={tops[1]} />
      <rect x="8" y={y} width="1" height="1" fill={tops[2]} />
    </g>
  )
}

export function Character({ emotion, bottom = '34%' }) {
  const sad = String(emotion).startsWith('sad')
  const dead = emotion === 'dead'
  const happy = emotion === 'happy'
  const bouquetState = dead || sad ? 'wilt' : happy ? 'open' : 'fresh'
  const animClass = dead ? '' : happy ? 'sprite-sway' : 'sprite-breathe'

  return (
    <div
      data-testid="character"
      data-emotion={emotion}
      className="absolute"
      style={{
        left: '50%',
        bottom,
        width: 48,
        height: 66,
        transform: 'translateX(-50%)',
        transition: 'bottom 900ms ease-out, opacity 900ms ease-out',
        opacity: dead ? 0.5 : sad ? 0.85 : 1,
        filter: sad || dead ? 'saturate(0.55)' : 'none',
      }}
      aria-hidden="true"
    >
      <div
        data-testid="sprite-anim"
        className={animClass}
        style={{
          width: '100%',
          height: '100%',
          transform: dead ? 'rotate(90deg)' : 'none',
          transformOrigin: 'center bottom',
          transition: 'transform 600ms ease-out',
        }}
      >
        <svg viewBox="0 0 12 16" width="100%" height="100%" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
          <rect x="3" y="0" width="6" height="2" fill={HAIR} />
          <rect x="4" y="1" width="4" height="3" fill={SKIN} />
          <rect x="5" y={sad || dead ? 3 : 2} width="1" height="1" fill={INK} />
          <rect x="7" y={sad || dead ? 3 : 2} width="1" height="1" fill={INK} />
          <rect x="4" y="4" width="4" height="5" fill={SHIRT} />
          {happy ? (
            <>
              <rect x="2" y="2" width="1" height="3" fill={SKIN} />
              <rect x="9" y="2" width="1" height="3" fill={SKIN} />
            </>
          ) : (
            <>
              <rect x="3" y="5" width="1" height="2" fill={SKIN} />
              <rect x="8" y="5" width="1" height="2" fill={SKIN} />
            </>
          )}
          <rect x="4" y="9" width="1" height="4" fill={PANTS} />
          <rect x="7" y="9" width="1" height="4" fill={PANTS} />
          <rect x="4" y="13" width="2" height="1" fill={INK} />
          <rect x="6" y="13" width="2" height="1" fill={INK} />
          {!dead && <Bouquet state={bouquetState} />}
        </svg>
      </div>
    </div>
  )
}
