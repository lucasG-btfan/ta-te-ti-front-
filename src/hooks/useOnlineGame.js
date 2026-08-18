import { useEffect, useRef, useState } from 'react'
import { connectWebSocket } from '../lib/ws.js'
import { createEmptyBoard } from '../lib/gameLogic.js'

const PUNTAJES_INICIALES = { X: 0, O: 0 }

export function useOnlineGame() {
  const [board, setBoard] = useState(createEmptyBoard)
  const [turno, setTurno] = useState('X')
  const [ganador, setGanador] = useState(null)
  const [empate, setEmpate] = useState(false)
  const [puntajes, setPuntajes] = useState(PUNTAJES_INICIALES)
  const [rol, setRol] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [estado, setEstado] = useState('conectando')
  const [error, setError] = useState('')

  const socketRef = useRef(null)
  const estadoRef = useRef('conectando')

  function setEstadoRef(nuevo) {
    estadoRef.current = nuevo
    setEstado(nuevo)
  }

  function aplicarEstado(msg) {
    setBoard(msg.tablero)
    setTurno(msg.turno)
    setGanador(msg.ganador)
    setEmpate(msg.empate)
    setPuntajes(msg.puntajes)
    setError('')
    if (msg.ganador || msg.empate) {
      setEstadoRef('terminada')
    } else if (estadoRef.current !== 'jugando') {
      setEstadoRef('jugando')
    }
  }

  function manejarMensaje(msg) {
    switch (msg.type) {
      case 'sala_creada':
        setRol(msg.rol)
        setCodigo(msg.codigo)
        setError('')
        setEstadoRef('esperando_oponente')
        break
      case 'sala_unida':
        setRol(msg.rol)
        setError('')
        setEstadoRef('sala_unida')
        break
      case 'estado':
        aplicarEstado(msg)
        break
      case 'error':
        setError(msg.mensaje)
        setEstadoRef('error')
        break
      case 'oponente_salio':
        setBoard(createEmptyBoard())
        setTurno('X')
        setGanador(null)
        setEmpate(false)
        setError('')
        setEstadoRef('oponente_salio')
        break
      default:
        break
    }
  }

  function handleOpen() {
    if (estadoRef.current === 'conectando') {
      setEstadoRef('conectado')
    }
  }

  function handleClose() {
    if (estadoRef.current !== 'terminada' && estadoRef.current !== 'error') {
      setError('Conexión perdida. Volvé al lobby e intentá de nuevo.')
      setEstadoRef('error')
    }
  }

  function asegurarSocket() {
    if (socketRef.current) return
    socketRef.current = connectWebSocket(manejarMensaje, handleOpen, handleClose)
  }

  useEffect(() => {
    asegurarSocket()
    return () => {
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [])

  function enviar(mensaje) {
    socketRef.current?.send(mensaje)
  }

  function crearPartida() {
    setError('')
    setEstadoRef('conectando')
    asegurarSocket()
    enviar({ type: 'crear' })
  }

  function unirsePartida(codigoPartida) {
    setError('')
    setEstadoRef('conectando')
    setCodigo(codigoPartida)
    asegurarSocket()
    enviar({ type: 'unirse', codigo: codigoPartida })
  }

  function hacerJugada(pos) {
    if (estadoRef.current !== 'jugando') return
    enviar({ type: 'jugada', posicion: pos })
  }

  function reiniciar() {
    enviar({ type: 'reiniciar' })
  }

  function salir() {
    socketRef.current?.close()
    socketRef.current = null
    setBoard(createEmptyBoard())
    setTurno('X')
    setGanador(null)
    setEmpate(false)
    setPuntajes(PUNTAJES_INICIALES)
    setRol(null)
    setCodigo('')
    setError('')
    setEstadoRef('conectando')
  }

  return {
    board,
    turno,
    ganador,
    empate,
    puntajes,
    rol,
    codigo,
    estado,
    error,
    crearPartida,
    unirsePartida,
    hacerJugada,
    reiniciar,
    salir,
  }
}
