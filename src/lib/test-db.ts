import mongoose from "mongoose";
import { connectDB } from "./db";

export async function insertTestData() {
  await connectDB();

  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not available");
  }

  const collection = db.collection("test");
  const result = await collection.insertOne({
    message: "MongoDB is working",
    createdAt: new Date().toISOString(),
  });

  return result;
}
