import { betterAuth } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { admin } from "better-auth/plugins/admin";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(MONGODB_URI);

const db = client.db("promethix3d");

let adminSync: Promise<void> | undefined;

export function syncEnvAdmin() {
  if (!adminSync) {
    adminSync = syncEnvAdminAccount().catch((error) => {
      adminSync = undefined;
      throw error;
    });
  }
  return adminSync;
}

async function syncEnvAdminAccount() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be defined");
  }

  const users = db.collection("user");
  const accounts = db.collection("account");
  const now = new Date();
  const existingUser = await users.findOne({ email });
  const userId = existingUser?._id ?? new ObjectId();

  if (existingUser) {
    await users.updateOne(
      { _id: existingUser._id },
      {
        $set: { role: "admin", emailVerified: true, updatedAt: now },
        $unset: { id: "" },
      },
    );
  } else {
    await users.insertOne({
      _id: userId,
      name: "Promethix Admin",
      email,
      emailVerified: true,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    });
  }

  const existingAccount = await accounts.findOne({
    $or: [{ userId }, { userId: existingUser?.id }, { accountId: existingUser?.id }],
    providerId: "credential",
  });
  const passwordHash = await hashPassword(password);

  if (existingAccount) {
    await accounts.updateOne(
      { _id: existingAccount._id },
      {
        $set: {
          accountId: userId.toHexString(),
          userId,
          password: passwordHash,
          updatedAt: now,
        },
        $unset: { id: "" },
      },
    );
    return;
  }

  await accounts.insertOne({
    accountId: userId.toHexString(),
    providerId: "credential",
    userId,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  });
}

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
