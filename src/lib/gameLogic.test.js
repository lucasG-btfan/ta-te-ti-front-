import { describe, it, expect } from 'vitest'
import {
  createEmptyBoard,
  calculateWinner,
  isBoardFull,
  generarCodigo,
} from './gameLogic.js'

describe('createEmptyBoard', () => {
  it('devuelve un tablero de 9 celdas', () => {
    expect(createEmptyBoard()).toHaveLength(9)
  })

  it('devuelve todas las celdas vacías (null)', () => {
    expect(createEmptyBoard()).toEqual(Array(9).fill(null))
  })

  it('devuelve un tablero nuevo en cada llamada (sin estado compartido)', () => {
    const board = createEmptyBoard()
    board[0] = 'X'
    expect(createEmptyBoard()[0]).toBeNull()
  })
})

describe('calculateWinner', () => {
  it('detecta la X ganando en una fila', () => {
    const board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null,
    ]
    expect(calculateWinner(board)).toBe('X')
  })

  it('detecta la X ganando en una columna', () => {
    const board = [
      'X', 'O', null,
      'X', 'O', null,
      'X', null, null,
    ]
    expect(calculateWinner(board)).toBe('X')
  })

  it('detecta la X ganando en diagonal', () => {
    const board = [
      'X', 'O', null,
      'O', 'X', null,
      null, null, 'X',
    ]
    expect(calculateWinner(board)).toBe('X')
  })

  it('detecta la O ganando', () => {
    const board = [
      'O', 'X', 'X',
      null, 'O', null,
      null, null, 'O',
    ]
    expect(calculateWinner(board)).toBe('O')
  })

  it('devuelve null cuando no hay ganador en un juego en curso', () => {
    const board = [
      'X', null, 'O',
      null, 'X', null,
      null, null, null,
    ]
    expect(calculateWinner(board)).toBeNull()
  })

  it('devuelve null cuando hay empate', () => {
    const board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ]
    expect(calculateWinner(board)).toBeNull()
  })
})

describe('isBoardFull', () => {
  it('devuelve false con celdas vacías', () => {
    const board = [
      'X', 'O', 'X',
      'X', null, 'O',
      'O', 'X', 'X',
    ]
    expect(isBoardFull(board)).toBe(false)
  })

  it('devuelve true cuando no quedan celdas vacías', () => {
    const board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ]
    expect(isBoardFull(board)).toBe(true)
  })
})

describe('generarCodigo', () => {
  it('devuelve un código de exactamente 6 caracteres', () => {
    expect(generarCodigo()).toHaveLength(6)
  })

  it('devuelve solo caracteres alfanuméricos en mayúsculas', () => {
    expect(generarCodigo()).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('genera códigos distintos entre llamadas', () => {
    expect(generarCodigo()).not.toBe(generarCodigo())
  })
})
