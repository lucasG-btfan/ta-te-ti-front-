import Square from './Square.jsx'

export default function Board({ board, onPlay, disabled }) {
  return (
    <div className="board">
      {board.map((value, index) => (
        <Square
          key={index}
          value={value}
          onClick={() => onPlay(index)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
