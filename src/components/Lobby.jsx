import { useState } from 'react'

export default function Lobby({ onCreate, onJoin }) {
  const [codigo, setCodigo] = useState('')

  function handleJoin(e) {
    e.preventDefault()
    if (codigo.trim()) onJoin(codigo.trim())
  }

  return (
    <div className="lobby flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="lobby__title">Ta-Te-Ti</h1>
      <button type="button" className="btn btn--primary" onClick={onCreate}>
        Crear partida
      </button>
      <form className="lobby__join flex items-center gap-2" onSubmit={handleJoin}>
        <input
          type="text"
          className="lobby__input"
          placeholder="Código"
          value={codigo}
          maxLength={6}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          aria-label="Código de partida"
        />
        <button type="submit" className="btn">
          Unirse
        </button>
      </form>
    </div>
  )
}
