import {
  connectRedis,
  getAvailableRooms,
  getRoom,
} from "../src/services/redisService";

async function check() {
  await connectRedis();
  const rooms = await getAvailableRooms();
  console.log("Rooms in Redis:", rooms);

  for (const roomId of rooms) {
    const room = await getRoom(roomId);
    console.log(
      `Room ${roomId}:`,
      room ? "Exists" : "Null data",
      room?.players.length,
      "players"
    );
  }
  process.exit(0);
}

check();
