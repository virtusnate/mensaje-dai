// Pixel-art man who offers a bouquet. Grounded + centered; subtle breathing while idle
// (no walk cycle, no bob). Emotion drives pose/tint and the bouquet state. `dead` topples him.
// `scale` enlarges the whole sprite (e.g. bigger on the question screen).
const SKIN = '#F0C39B'
const SKIN_SH = '#D9A87F'
const HAIR = '#3A2A20'
const SHIRT = '#4A7B8C'
const SHIRT_SH = '#3A6072'
const PANTS = '#3A3550'
const SHOE = '#2C1A0E'
const INK = '#2C1A0E'
const STEM = '#4A6B3E'

function Bouquet({ state }) {
  // state: 'fresh' | 'open' | 'wilt'
  const dy = state === 'open' ? -3 : state === 'wilt' ? 1 : 0
  const tops = state === 'wilt' ? ['#7A6A72', '#6A6458', '#7A6A72', '#6A6458'] : ['#E8697F', '#FBF3DE', '#F4C36A', '#E8B4B8']
  return (
    <g data-testid="bouquet" transform={`translate(0 ${dy})`}>
      <rect x="7" y="11" width="1" height="3" fill={STEM} />
      <rect x="8" y="11" width="1" height="3" fill={STEM} />
      <rect x="6" y="10" width="1" height="1" fill={tops[0]} />
      <rect x="8" y="9" width="1" height="1" fill={tops[1]} />
      <rect x="9" y="10" width="1" height="1" fill={tops[2]} />
      <rect x="7" y="10" width="1" height="1" fill={tops[3]} />
    </g>
  )
}

export function Character({ emotion, bottom = '34%', scale = 1 }) {
  const sad = String(emotion).startsWith('sad')
  const dead = emotion === 'dead'
  const happy = emotion === 'happy'
  const bouquetState = dead || sad ? 'wilt' : happy ? 'open' : 'fresh'
  const animClass = dead ? '' : happy ? 'sprite-sway' : 'sprite-breathe'
  const eyeY = sad || dead ? 5 : 4

  return (
    <div
      data-testid="character"
      data-emotion={emotion}
      className="absolute"
      style={{
        left: '50%',
        bottom,
        width: 52,
        height: 65,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: 'center bottom',
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
        <svg viewBox="0 0 16 20" width="100%" height="100%" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
          {/* hair */}
          <rect x="5" y="0" width="6" height="1" fill={HAIR} />
          <rect x="4" y="1" width="8" height="2" fill={HAIR} />
          <rect x="4" y="3" width="1" height="2" fill={HAIR} />
          <rect x="11" y="3" width="1" height="2" fill={HAIR} />
          {/* face */}
          <rect x="5" y="3" width="6" height="4" fill={SKIN} />
          <rect x="10" y="4" width="1" height="2" fill={SKIN_SH} />
          {/* eyes + mouth */}
          <rect x="6" y={eyeY} width="1" height="1" fill={INK} />
          <rect x="9" y={eyeY} width="1" height="1" fill={INK} />
          {happy
            ? <rect x="6" y="6" width="4" height="1" fill={INK} />
            : sad || dead
              ? <rect x="7" y="6" width="2" height="1" fill={INK} />
              : <rect x="7" y="6" width="2" height="1" fill={INK} />}
          {/* neck */}
          <rect x="7" y="7" width="2" height="1" fill={SKIN} />
          {/* shirt + shade */}
          <rect x="5" y="8" width="6" height="7" fill={SHIRT} />
          <rect x="5" y="13" width="6" height="2" fill={SHIRT_SH} />
          {/* arms */}
          {happy ? (
            <>
              <rect x="3" y="5" width="1" height="4" fill={SHIRT} />
              <rect x="12" y="5" width="1" height="4" fill={SHIRT} />
              <rect x="3" y="4" width="1" height="1" fill={SKIN} />
              <rect x="12" y="4" width="1" height="1" fill={SKIN} />
            </>
          ) : (
            <>
              <rect x="4" y="8" width="1" height="5" fill={SHIRT} />
              <rect x="11" y="8" width="1" height="5" fill={SHIRT} />
              <rect x="4" y="13" width="1" height="1" fill={SKIN} />
              <rect x="11" y="13" width="1" height="1" fill={SKIN} />
            </>
          )}
          {/* legs + shoes */}
          <rect x="6" y="15" width="1" height="4" fill={PANTS} />
          <rect x="9" y="15" width="1" height="4" fill={PANTS} />
          <rect x="5" y="19" width="2" height="1" fill={SHOE} />
          <rect x="9" y="19" width="2" height="1" fill={SHOE} />
          {/* the bouquet he offers (dropped when dead) */}
          {!dead && <Bouquet state={bouquetState} />}
        </svg>
      </div>
    </div>
  )
}
