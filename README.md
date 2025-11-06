# 🎮 Who is Who - Joc Multiplayer

**Who is Who** és una implementació del clàssic joc d'endevinar personatges, amb suport per taulers personalitzats, comunicació en temps real i mode asíncron.

## 📋 Descripció del Joc

El joc comença amb dos jugadors connectats a una sala on es carrega un tauler escollit, que pot ser amb cartes totalment personalitzades amb imatges i atributs propis. L'aplicació assigna un personatge secret a cadascun.

Els jugadors s'alternen els torns, on el jugador actiu formula una pregunta que només pot ser contestada amb un "Sí" o un "No" (basada en els atributs del tauler, per exemple: "Té barba?"). El jugador oponent respon, i aquesta resposta es transmet immediatament (en temps real) o es desa per al pròxim accés (mode asíncron).

Després de rebre la resposta, el jugador actiu fa clic a la seva pròpia graella per eliminar (voltejar) totes les cartes que no compleixen la condició. La partida continua amb l'alternança de torns fins que un dels jugadors creu saber qui és el personatge secret de l'oponent i fa la seva "aposta final".

Si encerta, guanya la partida; si falla, perd automàticament.

## 🏗️ Arquitectura

```
WHOisWHO/
├── Backend/          # Servidor Node.js amb Express i Socket.IO
├── Frontend/         # Client React amb Vite
├── docker-compose.yml # Configuració de Redis
└── README.md
```

## 🚀 Tecnologies

### Backend
- **Node.js** + **Express** - Servidor web i API REST
- **Socket.IO** - Comunicació WebSocket en temps real
- **Redis** - Base de dades per persistència de dades
- **Multer** - Gestió de pujada d'imatges

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool i dev server
- **React Router** - Navegació entre pàgines
- **Socket.IO Client** - Client WebSocket
- **Axios** - Client HTTP per a l'API REST

## 📦 Instal·lació i Execució

### 1. Iniciar Redis amb Docker Compose

```bash
docker-compose up -d
```

Això iniciarà un contenidor Redis al port 6379.

### 2. Backend

```bash
cd Backend
npm install
npm run dev
```

El servidor s'executarà al port **3000**.

### 3. Frontend

```bash
cd Frontend
npm install
npm run dev
```

L'aplicació web s'executarà al port **5173**.

Accedeix a: [http://localhost:5173](http://localhost:5173)

## 🎯 Funcionalitats Principals

### ✅ Implementades

1. **Taulers Personalitzats**
   - Crear taulers amb cartes personalitzades
   - Afegir imatges i atributs propis a cada carta
   - Guardar i reutilitzar taulers

2. **Gestió de Sales**
   - Crear sales de joc
   - Unir-se a sales existents
   - Sales privades amb contrasenya (opcional)

3. **Mecànica de Joc**
   - Assignació aleatòria de personatges secrets
   - Sistema de torns alternats
   - Preguntes i respostes Sí/No
   - Eliminació interactiva de cartes
   - Aposta final per guanyar

4. **Comunicació en Temps Real**
   - WebSocket amb Socket.IO
   - Actualitzacions instantànies de l'estat del joc
   - Notificacions de torns i respostes

5. **Persistència amb Redis**
   - Guardar taulers, sales i partides
   - Recuperació d'estat en cas de desconnexió

## 📡 API Endpoints

### Taulers
- `POST /api/boards` - Crear un tauler
- `GET /api/boards` - Obtenir tots els taulers
- `GET /api/boards/:id` - Obtenir un tauler específic
- `PUT /api/boards/:id` - Actualitzar un tauler
- `DELETE /api/boards/:id` - Eliminar un tauler
- `POST /api/boards/upload-image` - Pujar una imatge

### Sales
- `POST /api/rooms` - Crear una sala
- `GET /api/rooms` - Obtenir totes les sales
- `GET /api/rooms/:id` - Obtenir una sala específica
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

## 🎨 Estructura de Dades

### Tauler (Board)
```javascript
{
  id: string,
  name: string,
  description: string,
  cards: [
    {
      id: string,
      name: string,
      image: string,
      attributes: {
        barba: "sí",
        ullsBlaus: "no",
        cabell: "castany"
        // ... més atributs personalitzats
      }
    }
  ],
  createdAt: string,
  createdBy: string
}
```

### Sala (Room)
```javascript
{
  id: string,
  name: string,
  boardId: string,
  maxPlayers: 2,
  players: [
    {
      id: string,
      name: string,
      socketId: string,
      joinedAt: string
    }
  ],
  status: "waiting" | "playing" | "finished",
  createdAt: string,
  password: string | null
}
```

### Partida (Game)
```javascript
{
  roomId: string,
  boardId: string,
  players: {
    [playerId]: {
      id: string,
      name: string,
      secretCharacter: string,
      flippedCards: string[],
      hasAnswered: boolean
    }
  },
  currentTurn: string,
  turnHistory: [
    {
      playerId: string,
      question: string,
      answer: boolean,
      timestamp: string
    }
  ],
  status: "active" | "finished",
  winner: string | null,
  createdAt: string
}
```

## 🔧 Variables d'Entorn

### Backend (.env)
```env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## 🐛 Debugging

Per veure els logs de Redis:
```bash
docker-compose logs -f db
```

Per aturar tots els serveis:
```bash
docker-compose down
```

## 📝 To-Do / Millores Futures

- [ ] Mode de joc contra IA
- [ ] Historial de partides
- [ ] Sistema de puntuació i rànquing
- [ ] Xat integrat entre jugadors
- [ ] Animacions i efectes sonors
- [ ] Taulers predefinits populars
- [ ] Suport per més de 2 jugadors
- [ ] Mode torneig

## 👥 Autors

Projecte desenvolupat per l'assignatura de Sistemes de Gestió de Bases de Dades.
**Amadeu Puto Amo**

## 📄 Llicència

MIT License