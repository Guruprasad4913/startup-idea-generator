import { MongoClient, Db, Collection } from "mongodb";
import { StartupProject } from "@/types";

const DEFAULT_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/startupgen";
const DEFAULT_DB = process.env.MONGODB_DB || "startupgen";

interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

declare const global: GlobalWithMongo;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

function getClientPromise(uri: string = DEFAULT_URI): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so the MongoClient instance
    // is not constantly recreated across hot-reloads.
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    return client.connect();
  }
}

export async function connectToDatabase(
  customUri?: string,
  customDbName?: string
): Promise<{ client: MongoClient; db: Db }> {
  const uri = customUri || process.env.MONGODB_URI || DEFAULT_URI;
  const dbName = customDbName || process.env.MONGODB_DB || DEFAULT_DB;

  const connectedClient = await getClientPromise(uri);
  const db = connectedClient.db(dbName);
  return { client: connectedClient, db };
}

export async function getProjectsCollection(
  customUri?: string
): Promise<Collection<StartupProject>> {
  const { db } = await connectToDatabase(customUri);
  return db.collection<StartupProject>("projects");
}

export async function getUsersCollection(
  customUri?: string
): Promise<Collection<any>> {
  const { db } = await connectToDatabase(customUri);
  return db.collection("users");
}

export async function testMongoConnection(
  customUri?: string
): Promise<{
  ok: boolean;
  message: string;
  dbName: string;
  latencyMs?: number;
}> {
  const startTime = Date.now();
  const uri = customUri || process.env.MONGODB_URI || DEFAULT_URI;
  const dbName = process.env.MONGODB_DB || DEFAULT_DB;

  try {
    const testClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    await testClient.connect();
    await testClient.db(dbName).command({ ping: 1 });
    const latencyMs = Date.now() - startTime;
    await testClient.close();

    return {
      ok: true,
      message: "Successfully connected to MongoDB",
      dbName,
      latencyMs,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.message || "Failed to connect to MongoDB",
      dbName,
    };
  }
}
