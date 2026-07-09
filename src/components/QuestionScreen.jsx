export function QuestionScreen({ onYes, onNo }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <h1
        className="font-script text-4xl md:text-5xl mb-12 max-w-lg"
        style={{ color: 'var(--sepia)', textShadow: '0 1px 6px rgba(255,255,255,0.3)' }}
      >
        ¿Quieres salir conmigo una vez más a la cineteca de Chapultepec?
      </h1>
      <div className="flex gap-6 items-center">
        <button
          onClick={onYes}
          className="px-8 py-3 rounded-full text-white font-body text-lg"
          style={{ background: 'var(--coral)', minHeight: '44px' }}
        >
          Sí
        </button>
        <button
          onClick={onNo}
          className="px-8 py-3 rounded-full text-white font-body text-lg"
          style={{ background: 'var(--muted-rose)', minHeight: '44px' }}
        >
          No
        </button>
      </div>
    </div>
  )
}
