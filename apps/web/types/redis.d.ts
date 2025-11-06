declare module "redis" {
  export interface RedisClientType {
    connect: () => Promise<void>;
    on: (event: string, cb: (err: unknown) => void) => void;
  }
  export function createClient(config: { url: string }): RedisClientType;
}


