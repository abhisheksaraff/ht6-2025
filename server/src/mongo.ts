export interface IMongoClient {
  connect: (connString: string) => Promise<void>;
  disconnect: () => Promise<void>;
  store: <T>(name: string, document: T, ttl: number) => Promise<void>;
  load: <T>(name: string) => Promise<T | null>;
}
