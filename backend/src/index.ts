import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import {
  connectRedis,
  createRoom,
  getRoom,
  addPlayerToRoom,
  updateRoom,
  setSecretCharacter,
  getSecretCharacter,
  deleteRoom,
  getAvailableRooms,
  addOnlineUser,
  removeOnlineUser,
} from "./services/redisService";
import {
  createUser,
  findUser,
  getStats,
  incrementWin,
  incrementLoss,
} from "./services/userService";
import { characters } from "./data/characters";
import { predefinedQuestions } from "./data/predefinedQuestions";
import { GameState, Character } from "./types";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store turn timers
const turnTimers = new Map<string, NodeJS.Timeout>();
// Store player room mapping for quick lookup on disconnect
const playerRooms = new Map<string, string>();

// Turn time limit in seconds
const TURN_TIME_LIMIT = 60; // default fallback

async function startTurnTimer(roomId: string, currentPlayerId: string) {
  // Clear existing timer if any
  if (turnTimers.has(roomId)) {
    clearTimeout(turnTimers.get(roomId)!);
  }

  const room = await getRoom(roomId);
  const limit =
    room?.turnTimeLimit || room?.config?.turnTime || TURN_TIME_LIMIT;

  const timer = setTimeout(async () => {
    const refreshed = await getRoom(roomId);
    if (
      refreshed &&
      refreshed.status === "playing" &&
      refreshed.turn === currentPlayerId
    ) {
      const otherPlayer = refreshed.players.find(
        (p) => p.id !== currentPlayerId
      );
      if (otherPlayer) {
        refreshed.turn = otherPlayer.id;
        refreshed.turnStartTime = Date.now();
        await updateRoom(roomId, refreshed);
        io.to(roomId).emit("room_update", refreshed);
        io.to(roomId).emit("turn_timeout", { playerId: currentPlayerId });
        startTurnTimer(roomId, otherPlayer.id);
      }
    }
  }, limit * 1000);

  turnTimers.set(roomId, timer);
}

function clearTurnTimer(roomId: string) {
  if (turnTimers.has(roomId)) {
    clearTimeout(turnTimers.get(roomId)!);
    turnTimers.delete(roomId);
  }
}

// API Routes
app.get("/api/characters", (req: Request, res: Response) => {
  res.json(characters);
});

app.get("/api/predefined-questions", (req: Request, res: Response) => {
  res.json(predefinedQuestions);
});

// Auth endpoints
app.post("/api/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing username or password" });
  try {
    const existing = await findUser(username);
    if (existing) return res.status(409).json({ error: "User already exists" });
    const hash = await bcrypt.hash(password, 10);
    await createUser(username, hash);
    await addOnlineUser(username);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Register error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.post("/api/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing username or password" });
  try {
    const user = await findUser(username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    await addOnlineUser(username);
    return res.json({ ok: true, username });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

// Get user stats
app.get("/api/stats/:username", async (req: Request, res: Response) => {
  const username = req.params.username;
  if (!username) return res.status(400).json({ error: "Missing username" });
  try {
    const stats = await getStats(username);
    return res.json(stats);
  } catch (err) {
    console.error("Stats error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("get_rooms", async () => {
    const rooms = await getAvailableRooms();
    socket.emit("rooms_list", rooms);
  });

  socket.on(
    "join_room",
    async ({
      roomId,
      username,
      config,
    }: {
      roomId: string;
      username: string;
      config?: any;
    }) => {
      let room = await getRoom(roomId);
      if (!room) {
        room = await createRoom(roomId, config);
      } else if (config && !room.config) {
        // Attach config if it was missing
        room.config = config;
        await updateRoom(roomId, room);
      }

      if (room.players.length >= 2) {
        // Check if player is already in room (reconnection)
        const existingPlayer = room.players.find((p) => p.id === socket.id);
        if (!existingPlayer) {
          socket.emit("error", "La sala està plena");
          return;
        }
      } else {
        // Check if player is already in room to avoid duplicates on re-joins
        const existingPlayer = room.players.find((p) => p.id === socket.id);
        if (!existingPlayer) {
          const newPlayer = {
            id: socket.id,
            name: username,
            lives: room.config?.mode === "lives" ? 2 : undefined,
          };
          const updatedRoom = await addPlayerToRoom(roomId, newPlayer);
          if (updatedRoom) room = updatedRoom;
        }
      }

      playerRooms.set(socket.id, roomId);
      socket.join(roomId);
      io.to(roomId).emit("room_update", room);
      // Send current stats to players who are connected
      try {
        for (const p of room.players) {
          if (p.name) {
            const s = await getStats(p.name);
            io.to(p.id).emit("stats_update", s);
          }
        }
      } catch (e) {
        console.error("Error sending stats on join:", e);
      }

      // Broadcast updated room list to everyone in lobby
      const availableRooms = await getAvailableRooms();
      io.emit("rooms_list", availableRooms);

      if (room && room.players.length === 2 && room.status === "waiting") {
        // Start Game
        room.status = "playing";
        room.turn = room.players[0].id; // Player 1 starts
        room.turnStartTime = Date.now();
        room.turnTimeLimit = room.config?.turnTime || TURN_TIME_LIMIT;

        // Initialize lives for 'lives' mode
        if (room.config?.mode === "lives") {
          room.players.forEach((p) => {
            if (p.lives === undefined) p.lives = 2;
          });
        }

        // Assign secret characters
        const char1 = characters[Math.floor(Math.random() * characters.length)];
        let char2 = characters[Math.floor(Math.random() * characters.length)];
        while (char1.id === char2.id) {
          char2 = characters[Math.floor(Math.random() * characters.length)];
        }

        await setSecretCharacter(roomId, room.players[0].id, char1.id);
        await setSecretCharacter(roomId, room.players[1].id, char2.id);
        await updateRoom(roomId, room);

        io.to(room.players[0].id).emit("secret_character", char1);
        io.to(room.players[1].id).emit("secret_character", char2);
        io.to(roomId).emit("game_started", room);

        // Start turn timer
        startTurnTimer(roomId, room.players[0].id);
      }
    }
  );

  socket.on(
    "ask_question",
    async ({
      roomId,
      question,
      attribute,
      value,
    }: {
      roomId: string;
      question: string;
      attribute: string;
      value: any;
    }) => {
      const room = await getRoom(roomId);
      if (room && room.turn === socket.id) {
        socket
          .to(roomId)
          .emit("receive_question", { question, attribute, value });
      }
    }
  );

  socket.on(
    "answer_question",
    async ({
      roomId,
      answer,
      attribute,
      value,
    }: {
      roomId: string;
      answer: boolean;
      attribute: string;
      value: any;
    }) => {
      // answer is boolean (yes/no)
      // Broadcast answer so the asker can update their board
      io.to(roomId).emit("receive_answer", {
        answer,
        attribute,
        value,
        from: socket.id,
      });

      // Switch turn
      const room = await getRoom(roomId);
      if (room) {
        const otherPlayer = room.players.find((p) => p.id !== socket.id);
        if (otherPlayer) {
          room.turn = socket.id; // The one who answered (socket.id) now gets the turn
          room.turnStartTime = Date.now();
          await updateRoom(roomId, room);
          io.to(roomId).emit("room_update", room);

          // Start timer for new turn
          startTurnTimer(roomId, socket.id);
        }
      }
    }
  );

  socket.on(
    "guess_character",
    async ({
      roomId,
      characterId,
    }: {
      roomId: string;
      characterId: number;
    }) => {
      const room = await getRoom(roomId);
      if (!room) return;

      const player = room.players.find((p) => p.id === socket.id);
      const opponent = room.players.find((p) => p.id !== socket.id);
      if (!opponent || !player) return;

      const opponentSecretId = await getSecretCharacter(roomId, opponent.id);

      if (opponentSecretId === characterId) {
        // Win - Correct guess
        clearTurnTimer(roomId);
        room.status = "finished";
        room.winner = socket.id;
        await updateRoom(roomId, room);
        io.to(roomId).emit("game_over", {
          winner: socket.id,
          reason: "Encertat! 🎉",
        });
        try {
          const winnerName = player.name!;
          const loserName = opponent.name!;
          const wStats = await incrementWin(winnerName);
          const lStats = await incrementLoss(loserName);
          // Emit updated stats to both players
          if (wStats) io.to(player.id).emit("stats_update", wStats);
          if (lStats) io.to(opponent.id).emit("stats_update", lStats);
        } catch (e) {
          console.error("Error updating stats:", e);
        }
      } else {
        // Wrong guess - Handle based on game mode
        const gameMode = room.config?.mode || "hardcore";

        if (gameMode === "hardcore") {
          clearTurnTimer(roomId);
          room.status = "finished";
          room.winner = opponent.id;
          await updateRoom(roomId, room);
          io.to(roomId).emit("game_over", {
            winner: opponent.id,
            reason: "Endevinalla incorrecta! ⚡",
          });
          try {
            const winnerName = opponent.name!;
            const loserName = player.name!;
            const wStats = await incrementWin(winnerName);
            const lStats = await incrementLoss(loserName);
            if (wStats) io.to(opponent.id).emit("stats_update", wStats);
            if (lStats) io.to(player.id).emit("stats_update", lStats);
          } catch (e) {
            console.error("Error updating stats:", e);
          }
        } else if (gameMode === "lives") {
          if (player.lives !== undefined) {
            player.lives -= 1;
            if (player.lives <= 0) {
              clearTurnTimer(roomId);
              room.status = "finished";
              room.winner = opponent.id;
              await updateRoom(roomId, room);
              io.to(roomId).emit("game_over", {
                winner: opponent.id,
                reason: "Sense vides! 💔",
              });
              try {
                const winnerName = opponent.name!;
                const loserName = player.name!;
                const wStats = await incrementWin(winnerName);
                const lStats = await incrementLoss(loserName);
                if (wStats) io.to(opponent.id).emit("stats_update", wStats);
                if (lStats) io.to(player.id).emit("stats_update", lStats);
              } catch (e) {
                console.error("Error updating stats:", e);
              }
            } else {
              room.turn = opponent.id;
              room.turnStartTime = Date.now();
              await updateRoom(roomId, room);
              io.to(roomId).emit("room_update", room);
              io.to(socket.id).emit("life_lost", {
                livesRemaining: player.lives,
              });
              startTurnTimer(roomId, opponent.id);
            }
          }
        }
      }
    }
  );

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      playerRooms.delete(socket.id);
      try {
        const room = await getRoom(roomId);
        if (room) {
          // Remove player from room
          const playerToRemove = room.players.find((p) => p.id === socket.id);
          if (playerToRemove && playerToRemove.name) {
            await removeOnlineUser(playerToRemove.name);
          }
          room.players = room.players.filter((p) => p.id !== socket.id);

          if (room.players.length === 0) {
            // Room is empty, delete it
            console.log(`Room ${roomId} empty, deleting...`);
            await deleteRoom(roomId);
            clearTurnTimer(roomId);
          } else {
            // One player left
            // If game was playing, declare remaining player as winner
            if (room.status === "playing") {
              room.status = "finished";
              const winner = room.players[0];
              room.winner = winner.id;
              room.turn = ""; // No turn

              await updateRoom(roomId, room);
              clearTurnTimer(roomId);

              io.to(roomId).emit("game_over", {
                winner: winner.id,
                reason: "El rival ha abandonat la partida 🏃‍♂️💨",
              });

              // Update stats
              try {
                if (winner.name) {
                  const wStats = await incrementWin(winner.name);
                  if (wStats) io.to(winner.id).emit("stats_update", wStats);
                }
              } catch (e) {
                console.error("Error updating stats on disconnect:", e);
              }
            } else {
              // If waiting, just update room
              await updateRoom(roomId, room);
              io.to(roomId).emit("room_update", room);
            }
          }
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

connectRedis().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
