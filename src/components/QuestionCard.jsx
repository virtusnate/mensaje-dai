import { useState } from 'react'

export function QuestionCard({ title, options, onAnswer }) {
  const [writing, setWriting] = useState(false)
  const [value, setValue] = useState('')

  function confirmOther() {
    const v = value.trim()
    if (v) onAnswer(v)
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end px-8 pb-16 text-center">
      <h2 className="font-body italic text-3xl md:text-4xl mb-8" style={{ color: 'var(--sepia)' }}>
        {title}
      </h2>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onAnswer(o)}
            className="px-5 py-3 rounded-xl font-body text-lg"
            style={{ background: 'var(--cream)', color: 'var(--sepia)', minHeight: '44px' }}
          >
            {o}
          </button>
        ))}

        {!writing ? (
          <button
            onClick={() => setWriting(true)}
            className="px-5 py-3 rounded-xl font-body text-lg italic"
            style={{ background: 'rgba(251,243,222,0.7)', color: 'var(--sepia)', minHeight: '44px' }}
          >
            Otro… ✎
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <label htmlFor="otro" className="sr-only">Otro</label>
            <input
              id="otro"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="px-4 py-3 rounded-xl font-body text-lg"
              style={{ background: 'white', color: 'var(--sepia)', minHeight: '44px' }}
              placeholder="Escribe aquí…"
              autoFocus
            />
            <button
              onClick={confirmOther}
              className="px-5 py-3 rounded-xl text-white font-body text-lg"
              style={{ background: 'var(--coral)', minHeight: '44px' }}
            >
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
