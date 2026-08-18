export default function GameStatus({ rol, turno, ganador, empate, puntajes, esperando }) {
  let estado
  if (esperando) {
    estado = <span>Esperando oponente...</span>
  } else if (ganador) {
    estado =
      ganador === rol ? (
        <span className="text-win">¡Ganaste!</span>
      ) : (
        <span className={ganador === 'X' ? 'mark-x' : 'mark-o'}>Ganó {ganador}</span>
      )
  } else if (empate) {
    estado = <span>Empate</span>
  } else {
    estado = (
      <span>
        Turno de <span className={turno === 'X' ? 'mark-x' : 'mark-o'}>{turno}</span>
      </span>
    )
  }

  return (
    <div className="status flex flex-col items-center gap-1 text-center">
      <p className="status__role">
        Sos <span className={rol === 'X' ? 'mark-x' : 'mark-o'}>{rol}</span>
      </p>
      <p className="status__estado">{estado}</p>
      <p className="status__score">
        X: {puntajes.X} <span className="status__score-sep">—</span> O: {puntajes.O}
      </p>
    </div>
  )
}
