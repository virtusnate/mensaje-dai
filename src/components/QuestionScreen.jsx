import { Character } from './Character'
import { Bloom } from './Bloom'
import { Flowers } from './Flowers'

export function QuestionScreen({ onYes, onNo }) {
  return (
    <div className="absolute inset-0 text-center">
      <Bloom intensity={0.7} />
      {/* Avatar arrives here for the first time, above the card */}
      <Character emotion="walk" bottom="58%" scale={1.45} />
      {/* Flowers for the proposition — a little meadow at his feet */}
      <Flowers />
      <div
        className="absolute left-0 right-0 bottom-0 px-6 pt-7 pb-9 rounded-t-3xl z-10"
        style={{
          minHeight: '44%',
          background: 'linear-gradient(180deg,#FDF7E6,#F3E4C6)',
          borderTop: '2px solid rgba(212,165,116,0.7)',
          boxShadow: '0 -10px 40px rgba(44,26,14,0.3)',
          color: 'var(--sepia)',
          animation: 'fade-rise 700ms ease-out both',
        }}
      >
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
            <span style={{ width: 26, height: 1, background: '#C86B5A' }} />
            <span style={{ color: '#C86B5A', fontSize: 12 }}>✿</span>
            <span style={{ width: 26, height: 1, background: '#C86B5A' }} />
          </div>
          <h1 className="font-body text-3xl md:text-4xl italic leading-snug mb-8">
            ¿Quieres salir conmigo una vez más a la cineteca de Chapultepec?
          </h1>
          <div className="flex gap-5 items-center justify-center">
            <button onClick={onYes} className="px-8 py-3 rounded-full text-white font-body text-lg" style={{ background: 'var(--coral)', minHeight: '44px' }}>Sí</button>
            <button onClick={onNo} className="px-8 py-3 rounded-full text-white font-body text-lg" style={{ background: 'var(--muted-rose)', minHeight: '44px' }}>No</button>
          </div>
        </div>
      </div>
    </div>
  )
}
