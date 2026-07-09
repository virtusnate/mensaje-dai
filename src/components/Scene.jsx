import { skyGradient, mixHex, lerp } from '../lib/progress'

// Romantic pixel-art landscape. The sky keeps the smooth warming transition (twilight → golden
// hour with p); in front is blocky pixel art: a moon that gives way to a glowing sun, fading
// stars, drifting clouds, and layered rolling hills. Rendered crisp via crispEdges.

// A chunky "pixel" disc (rows of 2-tall rects) — the sun/moon body.
function pixelDisc(cx, cy, fill, rows) {
  return rows.map((hw, i) => (
    <rect key={i} x={cx - hw} y={cy + i * 2} width={hw * 2} height="2" fill={fill} />
  ))
}
const SUN_ROWS = [3, 5, 7, 8, 8, 7, 5, 3]
const MOON_ROWS = [2, 4, 5, 6, 6, 5, 4, 2]

// Little rays radiating from the sun centre.
function sunRays(cx, cy, fill) {
  const dirs = [[0, -13], [0, 13], [-13, 0], [13, 0], [-9, -9], [9, -9], [-9, 9], [9, 9]]
  return dirs.map(([dx, dy], i) => (
    <rect key={i} x={cx + dx - 1} y={cy + dy - 1} width="2" height="2" fill={fill} />
  ))
}

// Blocky rolling hill as vertical columns whose height follows a gentle sine — pixel-art feel.
function pixelHill(baseY, amp, freq, phase, fill, key) {
  const cols = []
  for (let x = 0; x <= 120; x += 4) {
    const h = Math.round(amp * (0.5 + 0.5 * Math.sin(x / freq + phase)))
    const top = baseY - h
    cols.push(<rect key={`${key}-${x}`} x={x} y={top} width="4" height={90 - top} fill={fill} />)
  }
  return cols
}

// Soft rounded pixel cloud (three tiers).
function pixelCloud(x, y, key) {
  return (
    <g key={key} fill="#FEF8EA">
      <rect x={x + 3} y={y} width="4" height="2" />
      <rect x={x + 1} y={y + 2} width="8" height="2" />
      <rect x={x} y={y + 4} width="10" height="1" />
    </g>
  )
}

const CLOUDS = [[12, 16], [90, 10], [104, 28]]
const STARS = [
  [10, 8], [22, 14], [34, 6], [48, 12], [61, 7], [74, 15], [88, 9], [101, 13], [112, 6], [17, 22],
  [55, 20], [95, 22],
]

export function Scene({ p, drift = 0 }) {
  const sunColor = mixHex('#F0A85E', '#FFD86A', p)
  const backHill = mixHex('#7E8B93', '#E6B87A', p)
  const frontHill = mixHex('#4A5A4E', '#89A05A', p)
  const meadow = mixHex('#3E4A38', '#6E8B4E', p)
  const sunY = lerp(46, 22, p) // sun rises as the story progresses
  const sunCenterY = sunY + 8
  const starOpacity = Math.max(0, 1 - p * 1.6)
  // Moon owns the dusk; it hands off to the sun early, so the day clearly has a sun.
  const moonOpacity = Math.max(0, 1 - p * 2.4)
  const sunOpacity = Math.min(1, Math.max(0, (p - 0.28) * 3))
  const cloudOpacity = Math.min(0.9, Math.max(0, (p - 0.45) * 2))
  const moonColor = '#E9E6F2'

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        data-testid="scene-sky"
        className="absolute inset-0"
        style={{ background: skyGradient(p), transition: 'background 900ms ease-out' }}
      />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 120 90"
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated' }}
      >
        <defs>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#FFEFC0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFEFC0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g style={{ opacity: starOpacity, transition: 'opacity 900ms ease-out' }}>
          {STARS.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="1" height="1" fill="#FBF3DE" />
          ))}
        </g>
        <g data-testid="scene-parallax" transform={`translate(${drift} 0)`} style={{ transition: 'transform 900ms linear' }}>
          <g style={{ opacity: moonOpacity, transition: 'opacity 900ms ease-out' }}>{pixelDisc(92, 12, moonColor, MOON_ROWS)}</g>
          <g style={{ opacity: sunOpacity, transition: 'opacity 900ms ease-out' }}>
            <circle cx="58" cy={sunCenterY} r="22" fill="url(#sunGlow)" style={{ imageRendering: 'auto' }} />
            {sunRays(58, sunCenterY, '#FFE8A6')}
            {pixelDisc(58, sunY, sunColor, SUN_ROWS)}
          </g>
          <g style={{ opacity: cloudOpacity, transition: 'opacity 900ms ease-out' }}>
            {CLOUDS.map(([x, y], i) => pixelCloud(x, y, `c-${i}`))}
          </g>
          <g data-testid="scene-hills">{pixelHill(70, 14, 26, 1.3, backHill, 'b')}</g>
          <g>{pixelHill(78, 12, 15, 4.2, frontHill, 'f')}</g>
          <rect data-testid="scene-meadow" x="-40" y="82" width="200" height="8" fill={meadow} />
        </g>
      </svg>
    </div>
  )
}
