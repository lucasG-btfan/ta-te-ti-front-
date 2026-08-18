export default function Square({ value, onClick, disabled }) {
  return (
    <button
      type="button"
      className={`square ${value ? 'square--filled' : ''}`}
      onClick={() => onClick()}
      disabled={disabled}
      aria-label={value ? `Casilla con ${value}` : 'Casilla vacía'}
    >
      {value && (
        <svg key={value} className="mark" viewBox="0 0 100 100" aria-hidden="true">
          {value === 'X' ? (
            <>
              <line className="x-line" x1="20" y1="20" x2="80" y2="80" />
              <line className="x-line x-line--second" x1="80" y1="20" x2="20" y2="80" />
            </>
          ) : (
            <circle className="o-circle" cx="50" cy="50" r="35" pathLength="100" />
          )}
        </svg>
      )}
    </button>
  )
}
