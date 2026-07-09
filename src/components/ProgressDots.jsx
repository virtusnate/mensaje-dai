export function ProgressDots({ total, current }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          data-testid="dot"
          data-active={i === current ? 'true' : 'false'}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i === current ? 'var(--cream)' : 'rgba(251,243,222,0.35)' }}
        />
      ))}
    </div>
  )
}
