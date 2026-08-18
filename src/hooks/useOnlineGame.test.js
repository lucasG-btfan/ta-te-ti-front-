import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnlineGame } from './useOnlineGame.js'

class FakeWebSocket {
  static instances = []

  constructor(url) {
    this.url = url
    this.sent = []
    this.closed = false
    FakeWebSocket.instances.push(this)
  }

  send(data) {
    this.sent.push(data)
  }

  close() {
    this.closed = true
  }

  simulateMessage(raw) {
    this.onmessage?.({ data: raw })
  }
}

function enviar(msg) {
  return JSON.stringify(msg)
}

function ultimoEnviado(socket) {
  return JSON.parse(socket.sent[socket.sent.length - 1])
}

function primerSocket() {
  return FakeWebSocket.instances[0]
}

beforeEach(() => {
  FakeWebSocket.instances = []
  vi.stubGlobal('WebSocket', FakeWebSocket)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('useOnlineGame', () => {
  it('crearPartida envía {"type":"crear"}', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => result.current.crearPartida())
    const socket = primerSocket()
    expect(socket.sent).toHaveLength(1)
    expect(ultimoEnviado(socket)).toEqual({ type: 'crear' })
  })

  it('unirsePartida envía {"type":"unirse","codigo":...}', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => result.current.unirsePartida('ABC123'))
    const socket = primerSocket()
    expect(ultimoEnviado(socket)).toEqual({ type: 'unirse', codigo: 'ABC123' })
  })

  it('sala_creada fija rol X, codigo y estado esperando_oponente', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => {
      primerSocket().simulateMessage(enviar({ type: 'sala_creada', codigo: 'ABC123', rol: 'X' }))
    })
    expect(result.current.rol).toBe('X')
    expect(result.current.codigo).toBe('ABC123')
    expect(result.current.estado).toBe('esperando_oponente')
  })

  it('sala_unida fija rol O', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => {
      primerSocket().simulateMessage(enviar({ type: 'sala_unida', rol: 'O' }))
    })
    expect(result.current.rol).toBe('O')
  })

  it('estado actualiza tablero, turno y puntajes, y pasa a jugando', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => {
      primerSocket().simulateMessage(enviar({ type: 'sala_creada', codigo: 'ABC123', rol: 'X' }))
    })
    expect(result.current.estado).toBe('esperando_oponente')
    const tablero = ['X', null, null, null, 'O', null, null, null, null]
    act(() => {
      primerSocket().simulateMessage(
        enviar({ type: 'estado', tablero, turno: 'O', ganador: null, empate: false, puntajes: { X: 1, O: 0 } })
      )
    })
    expect(result.current.estado).toBe('jugando')
    expect(result.current.board).toEqual(tablero)
    expect(result.current.turno).toBe('O')
    expect(result.current.puntajes).toEqual({ X: 1, O: 0 })
  })

  it('estado con ganador pasa a terminada', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => {
      primerSocket().simulateMessage(enviar({ type: 'sala_creada', codigo: 'ABC123', rol: 'X' }))
    })
    const tablero = ['X', 'X', 'X', 'O', 'O', null, null, null, null]
    act(() => {
      primerSocket().simulateMessage(
        enviar({ type: 'estado', tablero, turno: 'X', ganador: 'X', empate: false, puntajes: { X: 1, O: 0 } })
      )
    })
    expect(result.current.ganador).toBe('X')
    expect(result.current.estado).toBe('terminada')
  })

  it('error fija el mensaje y estado error', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => {
      primerSocket().simulateMessage(enviar({ type: 'error', mensaje: 'Sala llena' }))
    })
    expect(result.current.error).toBe('Sala llena')
    expect(result.current.estado).toBe('error')
  })

  it('oponente_salio fija estado oponente_salio y reinicia el tablero', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => {
      primerSocket().simulateMessage(enviar({ type: 'sala_creada', codigo: 'ABC123', rol: 'X' }))
    })
    act(() => {
      primerSocket().simulateMessage(enviar({ type: 'oponente_salio' }))
    })
    expect(result.current.estado).toBe('oponente_salio')
    expect(result.current.board).toEqual(Array(9).fill(null))
    expect(result.current.ganador).toBeNull()
  })

  it('un nuevo estado tras oponente_salio vuelve a jugando', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => {
      primerSocket().simulateMessage(enviar({ type: 'oponente_salio' }))
    })
    act(() => {
      primerSocket().simulateMessage(
        enviar({ type: 'estado', tablero: Array(9).fill(null), turno: 'X', ganador: null, empate: false, puntajes: { X: 0, O: 0 } })
      )
    })
    expect(result.current.estado).toBe('jugando')
  })

  it('hacerJugada envía {"type":"jugada","posicion":...} cuando está jugando', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => {
      primerSocket().simulateMessage(enviar({ type: 'sala_creada', codigo: 'ABC123', rol: 'X' }))
    })
    act(() => {
      primerSocket().simulateMessage(
        enviar({ type: 'estado', tablero: Array(9).fill(null), turno: 'X', ganador: null, empate: false, puntajes: { X: 0, O: 0 } })
      )
    })
    act(() => result.current.hacerJugada(4))
    const socket = primerSocket()
    expect(socket.sent).toHaveLength(1)
    expect(ultimoEnviado(socket)).toEqual({ type: 'jugada', posicion: 4 })
  })

  it('hacerJugada no envía nada cuando no está jugando', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => result.current.hacerJugada(0))
    expect(primerSocket().sent).toHaveLength(0)
  })

  it('reiniciar envía {"type":"reiniciar"}', () => {
    const { result } = renderHook(() => useOnlineGame())
    act(() => result.current.reiniciar())
    const socket = primerSocket()
    expect(ultimoEnviado(socket)).toEqual({ type: 'reiniciar' })
  })

  it('cierra el socket al desmontar', () => {
    const { unmount } = renderHook(() => useOnlineGame())
    const socket = primerSocket()
    expect(socket.closed).toBe(false)
    unmount()
    expect(socket.closed).toBe(true)
  })
})
