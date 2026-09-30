import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Get MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI;

// Stop the application if MongoDB URL is missing
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

// Create MongoDB client
const client = new MongoClient(MONGODB_URI);

// Select the Promethix3D database
const db = client.db("promethix3d");

// Configure Better Auth
export const auth = betterAuth({
  // Store Better Auth data in MongoDB
  database: mongodbAdapter(db, {
    client,
  }),

  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
  },
});
