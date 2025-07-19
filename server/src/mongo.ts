export interface IMongoClient {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  store: <T>(name: string, document: T, ttl: number) => Promise<void>;
}
