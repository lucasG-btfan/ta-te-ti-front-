# Ta-Te-Ti Online — Frontend

Frontend del juego de ta-te-ti (tic-tac-toe) multiplayer en tiempo real para jugar con amigos. React + TypeScript + Vite + Tailwind CSS.

> Demostración en vivo: [ta-te-ti-front.vercel.app](https://ta-te-ti-front.vercel.app)

## Cómo funciona

- Creás una sala y recibís un **código de 6 caracteres** para compartir.
- Tu amigo se une con ese código y juegan por **WebSockets** en tiempo real.
- El servidor es la **fuente de verdad**: los clientes solo envían intenciones y reciben el estado completo de la partida (tablero, turno, ganador, puntajes).

## Tecnologías

- React 19 + TypeScript
- Vite + Tailwind CSS
- WebSockets (nativo del navegador)
- Vitest + Testing Library (tests de hooks, lógica del juego y manejo del socket)
- oxlint

## Requisitos

- Backend corriendo: [ta-te-ti-back-](https://github.com/lucasG-btfan/ta-te-ti-back-) (Python + FastAPI + WebSockets)

## Cómo correr

```bash
npm install
# opcional: apuntar a un backend distinto
# creá un .env con VITE_WS_URL=ws://localhost:8000/ws
npm run dev
```

El frontend se conecta a `ws://localhost:8000/ws` por defecto (las variables de entorno de Vite usan el prefijo `VITE_`).

## Scripts

| Comando          | Descripción                              |
|------------------|------------------------------------------|
| `npm run dev`    | Servidor de desarrollo                    |
| `npm run build`  | Typecheck + build de producción           |
| `npm run lint`   | Lint con oxlint                           |
| `npm test`       | Correr los tests (Vitest)                 |

## Estructura

```
src/
├── App.tsx                    # Pantallas: lobby y juego
├── components/
│   ├── Lobby.jsx              # Crear / unirse a sala con código
│   ├── Board.jsx / Square.jsx # Tablero
│   └── GameStatus.jsx         # Turno, ganador, puntajes
├── hooks/
│   └── useOnlineGame.js       # Estado del juego + ciclo de vida del socket
└── lib/
    ├── ws.js                  # Conexión WebSocket (con cola de mensajes)
    └── gameLogic.js           # Lógica pura del juego
```

## Deploy

Configuración de Vercel incluida (`vercel.json`, framework Vite). El proyecto conectado al backend define la URL del socket con `VITE_WS_URL` en las variables de entorno del deploy.