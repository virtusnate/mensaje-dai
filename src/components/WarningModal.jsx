export function WarningModal({ message, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(20,14,30,0.7)' }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="max-w-xs w-full rounded-2xl p-8 text-center"
        style={{ background: 'var(--cream)', color: 'var(--sepia)' }}
      >
        <p className="font-script text-3xl mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full text-white font-body"
          style={{ background: 'var(--coral)', minHeight: '44px' }}
        >
          Entiendo
        </button>
      </div>
    </div>
  )
}
