import { skyGradient, mixHex, lerp } from '../lib/progress'

// Romantic pixel-art landscape. The sky keeps the smooth warming transition (twilight → golden
// hour with p); everything in front is blocky pixel art: a rising sun, fading stars, layered
// rolling hills, and little flowers. Rendered crisp via shape-rendering=crispEdges.

// A chunky "pixel" circle (rows of 2-tall rects) that reads as a low-res sun.
function pixelSun(cx, cy, fill) {
  const rows = [2, 4, 5, 6, 6, 5, 4, 2] // half-widths per 2px row
  return rows.map((hw, i) => (
    <rect key={i} x={cx - hw} y={cy + i * 2} width={hw * 2} height="2" fill={fill} />
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

const STARS = [
  [10, 8], [22, 14], [34, 6], [48, 12], [61, 7], [74, 15], [88, 9], [101, 13], [112, 6], [17, 22],
  [55, 20], [95, 22],
]
const FLOWERS = [
  { x: 14, c: '#E8B4B8' }, { x: 33, c: '#FBF3DE' }, { x: 52, c: '#E2A0B0' },
  { x: 71, c: '#F4C99A' }, { x: 90, c: '#E8B4B8' }, { x: 104, c: '#FBF3DE' },
]

export function Scene({ p }) {
  const sunColor = mixHex('#E8965E', '#FFE39A', p)
  const backHill = mixHex('#7E8B93', '#E6B87A', p)
  const frontHill = mixHex('#4A5A4E', '#89A05A', p)
  const meadow = mixHex('#3E4A38', '#6E8B4E', p)
  const sunY = lerp(52, 34, p) // sun rises as the story progresses
  const starOpacity = Math.max(0, 1 - p * 1.6)

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
        {/* stars (dusk only) */}
        <g style={{ opacity: starOpacity, transition: 'opacity 900ms ease-out' }}>
          {STARS.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="1" height="1" fill="#FBF3DE" />
          ))}
        </g>
        {/* sun */}
        <g style={{ transition: 'all 900ms ease-out' }}>{pixelSun(60, sunY, sunColor)}</g>
        {/* distant hills */}
        <g data-testid="scene-hills">{pixelHill(70, 14, 26, 1.3, backHill, 'b')}</g>
        {/* front hills */}
        <g>{pixelHill(78, 12, 15, 4.2, frontHill, 'f')}</g>
        {/* meadow floor */}
        <rect data-testid="scene-meadow" x="0" y="82" width="120" height="8" fill={meadow} />
        {/* pixel flowers along the front hill */}
        {FLOWERS.map((fl, i) => (
          <g key={i}>
            <rect x={fl.x} y="76" width="1" height="4" fill="#4A6B3E" />
            <rect x={fl.x - 1} y="74" width="1" height="1" fill={fl.c} />
            <rect x={fl.x + 1} y="74" width="1" height="1" fill={fl.c} />
            <rect x={fl.x} y="73" width="1" height="1" fill={fl.c} />
            <rect x={fl.x} y="75" width="1" height="1" fill="#F7D489" />
          </g>
        ))}
      </svg>
    </div>
  )
}
