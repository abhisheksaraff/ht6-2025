import { MongoClient as MC } from "mongodb";

export interface IMongoClient {
  connect: (connString: string) => Promise<void>;
  disconnect: () => Promise<void>;
  store: <T>(name: string, document: T, ttl: number) => Promise<void>;
  load: <T>(name: string) => Promise<T | null>;
}

export class MongoClient implements IMongoClient {
  mongoClient: any;
  db: any;
  collection: any;

  constructor(){}

  async connect(connString: string) {
    try {
      this.mongoClient = new MC(connString);
      console.log("Connecting to MongoDB Atlas cluster...");
      await this.mongoClient.connect();
      this.db = this.mongoClient.db("FocusFox");
      this.collection = this.db.collection("content");
      console.log("Successfully connected to MongoDB Atlas!");
    } catch (error) {
      console.error("Connection to MongoDB Atlas failed!", error);
    }
  }

  disconnect = async () => {
    try {
      console.log("Closing connection to MongoDB Atlas...");
      await this.mongoClient.close();
      console.log("Connection to MongoDB Atlas closed.");
    } catch (error) {
      console.log("Closing MongoDB Atlas failed.");
    }
  };

  store = async <T>(name: string, document: T, ttl: number) => {
    try {
      const content = {
        id: name,
        ttl: ttl,
        document: document,
      };
      await this.collection.insertOne(content);
      console.log("Sotring to MongoDb successful.");
    } catch (error) {
      console.log("Storing to MongoDB Failed.");
    }
  };

  load = async <T>(name: string) => {
    try {
      return this.collection.find({ id: name }).toArray();
    } catch (error) {
      console.log("Loading from MongoDB Failed.");
    }
  };
}