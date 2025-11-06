# Who is Who - Backend

Backend per al joc Who is Who amb Node.js, Express, Socket.IO i Redis.

## 🚀 Característiques

- ✅ API REST per gestionar taulers i sales
- ✅ WebSocket amb Socket.IO per comunicació en temps real
- ✅ Persistència de dades amb Redis
- ✅ Suport per taulers personalitzats amb imatges
- ✅ Sistema de torns automàtic
- ✅ Gestió d'apostes finals

## 📦 Instal·lació

```bash
npm install
```

## 🔧 Configuració

Crea un fitxer `.env` amb les següents variables:

```env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## ▶️ Executar

```bash
# Mode desenvolupament
npm run dev

# Mode producció
npm start
```

## 📡 Endpoints API

### Taulers
- `POST /api/boards` - Crear un tauler
- `GET /api/boards` - Obtenir tots els taulers
- `GET /api/boards/:id` - Obtenir un tauler
- `PUT /api/boards/:id` - Actualitzar un tauler
- `DELETE /api/boards/:id` - Eliminar un tauler
- `POST /api/boards/upload-image` - Pujar una imatge

### Sales
- `POST /api/rooms` - Crear una sala
- `GET /api/rooms` - Obtenir totes les sales
- `GET /api/rooms/:id` - Obtenir una sala
- `POST /api/rooms/:id/join` - Unir-se a una sala
- `POST /api/rooms/:id/leave` - Sortir d'una sala
- `DELETE /api/rooms/:id` - Eliminar una sala

## 🔌 Events WebSocket

### Client → Server
- `joinRoom` - Unir-se a una sala
- `askQuestion` - Fer una pregunta
- `answerQuestion` - Respondre una pregunta
- `updateFlippedCards` - Actualitzar cartes eliminades
- `endTurn` - Passar el torn
- `makeFinalGuess` - Fer l'aposta final
- `leaveRoom` - Sortir de la sala

### Server → Client
- `roomUpdate` - Actualització de la sala
- `gameStart` - Inici de la partida
- `questionReceived` - Pregunta rebuda
- `answerReceived` - Resposta rebuda
- `turnChanged` - Canvi de torn
- `gameEnd` - Fi de la partida
- `playerLeft` - Jugador ha sortit
- `error` - Error

## 📁 Estructura

```
Backend/
├── src/
│   ├── config/
│   │   └── redis.js
│   ├── models/
│   │   ├── boardModel.js
│   │   ├── roomModel.js
│   │   └── gameModel.js
│   ├── routes/
│   │   ├── boardRoutes.js
│   │   └── roomRoutes.js
│   ├── sockets/
│   │   └── gameHandlers.js
│   └── server.js
├── uploads/
├── .env
└── package.json
```
