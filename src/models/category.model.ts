import mongoose, { Schema, Document } from "mongoose";

// Defines the TypeScript structure of a Category
export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Defines the MongoDB schema for categories
const categorySchema = new Schema<ICategory>(
  {
    // Category name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // URL-friendly category identifier
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Category description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Category image URL
    image: {
      type: String,
      default: "",
      trim: true,
    },

    // Controls whether the category is available
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Reuse the model during Next.js development
const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);

export default Category;
