// A soft radial warm glow centered behind the avatar. Intensity (0..1) drives opacity + size.
export function Bloom({ intensity }) {
  const size = 40 + intensity * 60
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div
        data-testid="bloom"
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: '30%',
          width: `${size}vmin`,
          height: `${size}vmin`,
          transform: 'translate(-50%, 50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,240,190,0.9) 0%, rgba(255,240,190,0) 65%)',
          opacity: intensity,
          transition: 'opacity 900ms ease-out, width 900ms ease-out, height 900ms ease-out',
        }}
      />
    </div>
  )
}
