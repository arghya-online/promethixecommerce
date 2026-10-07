import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(MONGODB_URI);

const db = client.db("promethix3d");

export const auth = betterAuth({
  // Do NOT pass the MongoClient.
  // This prevents Better Auth from using MongoDB transactions.
  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      // Normal registered users are customers
      defaultRole: "user",

      // Only users with the admin role get administrative access
      adminRoles: ["admin"],
    }),
  ],
});
