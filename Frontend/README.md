# Who is Who - Frontend

Frontend per al joc Who is Who amb React i Vite.

## 🚀 Característiques

- ✅ Interfície d'usuari moderna i responsive
- ✅ Comunicació en temps real amb Socket.IO
- ✅ Creació de taulers personalitzats
- ✅ Gestió de sales de joc
- ✅ Tauler de joc interactiu amb eliminació de cartes
- ✅ Sistema de torns i preguntes/respostes

## 📦 Instal·lació

```bash
npm install
```

## 🔧 Configuració

Crea un fitxer `.env` amb les següents variables:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## ▶️ Executar

```bash
# Mode desenvolupament
npm run dev

# Build de producció
npm run build

# Preview de producció
npm run preview
```

## 📁 Pàgines

- **Home** (`/`) - Pàgina d'inici amb informació del joc
- **Board Creator** (`/create-board`) - Crear taulers personalitzats
- **Room List** (`/rooms`) - Llistat de sales disponibles
- **Game Room** (`/game/:roomId`) - Sala de joc amb tauler interactiu

## 🎮 Com Jugar

1. **Crear un Tauler**: Accedeix a "Crear Tauler" i afegeix cartes amb imatges i atributs personalitzats
2. **Unir-se a una Sala**: Introdueix el teu nom i selecciona una sala disponible o crea'n una de nova
3. **Jugar**: 
   - Espera que un altre jugador s'uneixi
   - Cada jugador rep un personatge secret
   - Fes preguntes de Sí/No al teu torn
   - Elimina cartes que no compleixen les respostes
   - Fes l'aposta final quan creguis saber el personatge de l'oponent

## 🛠️ Tecnologies

- React 18
- Vite
- React Router DOM
- Socket.IO Client
- Axios
- CSS3
