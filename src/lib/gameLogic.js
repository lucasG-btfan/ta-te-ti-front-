const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function createEmptyBoard() {
  return Array(9).fill(null)
}

export function calculateWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

export function isBoardFull(board) {
  return board.every((cell) => cell !== null)
}

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generarCodigo() {
  let codigo = ''
  for (let i = 0; i < 6; i += 1) {
    const index = Math.floor(Math.random() * CODE_CHARS.length)
    codigo += CODE_CHARS[index]
  }
  return codigo
}
