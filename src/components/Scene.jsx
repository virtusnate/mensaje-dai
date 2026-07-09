import { skyGradient, mixHex } from '../lib/progress'

export function Scene({ p }) {
  const hillColor = mixHex('#40503F', '#6B7A4A', p)
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        data-testid="scene-sky"
        className="absolute inset-0"
        style={{ background: skyGradient(p), transition: 'background 700ms ease-out' }}
      />
      <div
        data-testid="scene-hills"
        className="absolute left-0 right-0"
        style={{
          bottom: '18%',
          height: '22%',
          background: hillColor,
          borderRadius: '50% 50% 0 0 / 40% 40% 0 0',
          transition: 'background 700ms ease-out',
        }}
      />
      <div
        data-testid="scene-meadow"
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: '22%',
          background: 'linear-gradient(var(--meadow-light), var(--meadow-deep))',
        }}
      />
    </div>
  )
}
