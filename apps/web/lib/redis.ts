import { createClient, RedisClientType } from "redis";

declare global {
  // Para evitar múltiples clientes en hot-reload (dev)
  // eslint-disable-next-line no-var
  var _redis: RedisClientType | undefined;
}

let client: RedisClientType;

export async function getRedis() {
  if (!globalThis._redis) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error("REDIS_URL no está definida");
    }
    const c: RedisClientType = createClient({ url });
    c.on("error", (err: unknown) => console.error("Redis error:", err));
    await c.connect();
    globalThis._redis = c;
  }
  client = globalThis._redis as RedisClientType;
  return client;
}
