const DEFAULT_URL = 'ws://localhost:8000/ws'

export function connectWebSocket(onMessage, onOpen, onClose) {
  const url = import.meta.env.VITE_WS_URL || DEFAULT_URL
  const socket = new WebSocket(url)
  const queue = []

  socket.onopen = () => {
    // Flush queued messages
    while (queue.length > 0) {
      const msg = queue.shift()
      socket.send(JSON.stringify(msg))
    }
    onOpen?.()
  }

  socket.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data))
    } catch (err) {
      console.error('Mensaje WebSocket inválido:', err)
    }
  }

  socket.onerror = (event) => {
    console.error('Error WebSocket:', event)
  }

  socket.onclose = () => {
    onClose?.()
  }

  function send(payload) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload))
    } else {
      // Queue until open
      queue.push(payload)
    }
  }

  function close() {
    socket.close()
  }

  return { send, close }
}
