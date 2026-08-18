import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { connectWebSocket } from './ws.js'

class FakeWebSocket {
  static instances = []
  static OPEN = 1

  constructor(url) {
    this.url = url
    this.sent = []
    this.closed = false
    this.readyState = 0 // CONNECTING
    this.onopen = null
    this.onclose = null
    FakeWebSocket.instances.push(this)
  }

  send(data) {
    this.sent.push(data)
  }

  close() {
    this.closed = true
  }

  simulateOpen() {
    this.readyState = 1 // OPEN
    this.onopen?.()
  }

  simulateClose() {
    this.onclose?.()
  }

  simulateMessage(raw) {
    this.onmessage?.({ data: raw })
  }
}

beforeEach(() => {
  FakeWebSocket.instances = []
  vi.stubGlobal('WebSocket', FakeWebSocket)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('connectWebSocket', () => {
  it('usa la URL por defecto ws://localhost:8000/ws cuando no hay VITE_WS_URL', () => {
    connectWebSocket(() => {})
    expect(FakeWebSocket.instances).toHaveLength(1)
    expect(FakeWebSocket.instances[0].url).toBe('ws://localhost:8000/ws')
  })

  it('usa VITE_WS_URL cuando está definida', () => {
    vi.stubEnv('VITE_WS_URL', 'ws://custom:1234/ws')
    connectWebSocket(() => {})
    expect(FakeWebSocket.instances[0].url).toBe('ws://custom:1234/ws')
  })

  it('send envía directamente cuando el socket está OPEN', () => {
    const client = connectWebSocket(() => {})
    const socket = FakeWebSocket.instances[0]
    socket.simulateOpen()
    client.send({ type: 'jugada', posicion: 4 })
    expect(socket.sent).toHaveLength(1)
    expect(JSON.parse(socket.sent[0])).toEqual({ type: 'jugada', posicion: 4 })
  })

  it('send encola mensajes cuando el socket no está OPEN y los envía al abrir', () => {
    const client = connectWebSocket(() => {})
    const socket = FakeWebSocket.instances[0]
    client.send({ type: 'crear' })
    client.send({ type: 'jugada', posicion: 2 })
    expect(socket.sent).toHaveLength(0)
    socket.simulateOpen()
    expect(socket.sent).toHaveLength(2)
  })

  it('deserializa los mensajes entrantes y llama onMessage con el objeto parseado', () => {
    const onMessage = vi.fn()
    connectWebSocket(onMessage)
    const socket = FakeWebSocket.instances[0]
    const payload = { type: 'estado', tablero: [null, null, null], turno: 'X' }
    socket.simulateMessage(JSON.stringify(payload))
    expect(onMessage).toHaveBeenCalledTimes(1)
    expect(onMessage).toHaveBeenCalledWith(payload)
  })

  it('ignora mensajes entrantes que no son JSON válido', () => {
    const onMessage = vi.fn()
    connectWebSocket(onMessage)
    const socket = FakeWebSocket.instances[0]
    socket.simulateMessage('no-soy-json')
    expect(onMessage).not.toHaveBeenCalled()
  })

  it('close cierra el socket subyacente', () => {
    const client = connectWebSocket(() => {})
    const socket = FakeWebSocket.instances[0]
    client.close()
    expect(socket.closed).toBe(true)
  })

  it('llama onOpen cuando el socket se abre', () => {
    const onOpen = vi.fn()
    connectWebSocket(() => {}, onOpen)
    const socket = FakeWebSocket.instances[0]
    socket.simulateOpen()
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('llama onClose cuando el socket se cierra', () => {
    const onClose = vi.fn()
    connectWebSocket(() => {}, undefined, onClose)
    const socket = FakeWebSocket.instances[0]
    socket.simulateClose()
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
