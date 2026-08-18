import { useState } from 'react'
import Lobby from './components/Lobby.jsx'
import Board from './components/Board.jsx'
import GameStatus from './components/GameStatus.jsx'
import { useOnlineGame } from './hooks/useOnlineGame.js'

type Screen = 'lobby' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('lobby')
  const [copied, setCopied] = useState(false)
  const {
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
  } = useOnlineGame()

  const esperando = estado === 'esperando_oponente' || estado === 'oponente_salio'
  const gameOver = Boolean(ganador) || empate
  const boardDisabled = estado !== 'jugando' || gameOver

  function handleCreate() {
    crearPartida()
    setScreen('game')
  }

  function handleJoin(code: string) {
    unirsePartida(code)
    setScreen('game')
  }

  function handleCopy() {
    navigator.clipboard.writeText(codigo)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleBackToLobby() {
    salir()
    setScreen('lobby')
  }

  if (screen === 'lobby') {
    return (
      <div className="relative">
        <Lobby onCreate={handleCreate} onJoin={handleJoin} />
        {error && (
          <p
            className="fixed bottom-8 left-0 right-0 text-center text-sm text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="app flex min-h-screen flex-col items-center justify-center gap-5 p-4">
      <GameStatus
        rol={rol}
        turno={turno}
        ganador={ganador}
        empate={empate}
        puntajes={puntajes}
        esperando={esperando}
      />

      {estado === 'oponente_salio' && (
        <p className="text-sm text-amber-300" role="status">
          El oponente salió. Esperando a que se una alguien con tu código...
        </p>
      )}

      <Board board={board} onPlay={hacerJugada} disabled={boardDisabled} />

      <div className="hud flex flex-wrap items-center justify-center gap-3 text-sm">
        {codigo ? (
          <>
            <span className="hud__codigo">
              codigo para unirse: <strong className="hud__codigo-value">{codigo}</strong>
            </span>
            <button
              type="button"
              className="btn btn--small"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </>
        ) : null}
        <button type="button" className="btn btn--small" onClick={reiniciar}>
          Nueva partida
        </button>
        <button
          type="button"
          className="btn btn--small btn--ghost"
          onClick={handleBackToLobby}
        >
          Salir
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default App
