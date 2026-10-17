import mongoose from "mongoose";

// Get MongoDB connection URL from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Make sure the connection URL exists
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

// Connect to MongoDB
export async function connectDB() {
  // If already connected, don't create another connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // Connect Mongoose to MongoDB
  await mongoose.connect(MONGODB_URI!, {
    dbName: process.env.DB_NAME || "promethix3d",
  });

  console.log("MongoDB connected successfully to:", mongoose.connection.name);
}

