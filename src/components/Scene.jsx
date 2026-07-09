import { skyGradient, mixHex, lerp } from '../lib/progress'

// Romantic pixel-art landscape. The sky keeps the smooth warming transition (twilight → golden
// hour with p); everything in front is blocky pixel art: a rising sun, fading stars, layered
// rolling hills. Rendered crisp via shape-rendering=crispEdges.

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

// Blocky pixel cloud (two stacked rows) that reads at low res.
function pixelCloud(x, y, key) {
  return (
    <g key={key} fill="#FBF3DE">
      <rect x={x + 2} y={y} width="6" height="2" />
      <rect x={x} y={y + 2} width="10" height="2" />
    </g>
  )
}

const CLOUDS = [
  [14, 14], [70, 8], [98, 20],
]
const STARS = [
  [10, 8], [22, 14], [34, 6], [48, 12], [61, 7], [74, 15], [88, 9], [101, 13], [112, 6], [17, 22],
  [55, 20], [95, 22],
]

export function Scene({ p, drift = 0 }) {
  const sunColor = mixHex('#E8965E', '#FFE39A', p)
  const backHill = mixHex('#7E8B93', '#E6B87A', p)
  const frontHill = mixHex('#4A5A4E', '#89A05A', p)
  const meadow = mixHex('#3E4A38', '#6E8B4E', p)
  const sunY = lerp(52, 34, p) // sun rises as the story progresses
  const starOpacity = Math.max(0, 1 - p * 1.6)
  // Moon owns the dusk; it fades as the sun rises into the golden hour.
  const moonOpacity = Math.max(0, 1 - p * 1.8)
  const sunOpacity = Math.min(1, Math.max(0, (p - 0.35) * 2))
  const cloudOpacity = Math.min(0.85, Math.max(0, (p - 0.4) * 1.8)) // clouds belong to the day
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
        <g style={{ opacity: starOpacity, transition: 'opacity 900ms ease-out' }}>
          {STARS.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="1" height="1" fill="#FBF3DE" />
          ))}
        </g>
        <g data-testid="scene-parallax" transform={`translate(${drift} 0)`} style={{ transition: 'transform 900ms linear' }}>
          <g style={{ opacity: moonOpacity, transition: 'opacity 900ms ease-out' }}>{pixelSun(88, 14, moonColor)}</g>
          <g style={{ opacity: sunOpacity, transition: 'opacity 900ms ease-out' }}>{pixelSun(60, sunY, sunColor)}</g>
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
