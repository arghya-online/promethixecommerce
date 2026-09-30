import mongoose, { Schema, Document } from "mongoose";

// Defines the TypeScript structure of a User
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Defines the MongoDB/Mongoose schema
const userSchema = new Schema<IUser>(
  {
    // User's name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // User's email address
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Hashed password
    password: {
      type: String,
      required: true,
    },

    // User's access level
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    // Whether the account is active
    isActive: {
      type: Boolean,
      default: true,
    },
  },

  // Automatically creates createdAt and updatedAt
  {
    timestamps: true,
  },
);

// Create the User model or reuse the existing model
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
