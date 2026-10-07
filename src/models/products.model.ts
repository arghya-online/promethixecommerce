import mongoose, { Schema, Document } from "mongoose";

// Defines the TypeScript structure of a Product
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Defines the MongoDB/Mongoose schema
const productSchema = new Schema<IProduct>(
  {
    // Product name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // URL-friendly product identifier
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Product description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Product selling price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Product category
    // References the category this product belongs to
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Product image URLs
    images: {
      type: [String],
      default: [],
    },

    // Number of units currently available
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Whether the product is available for customers
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

// Create the Product model or reuse it if it already exists
const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
