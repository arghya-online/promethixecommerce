import mongoose, { Document, Schema } from "mongoose";

// Defines the structure of a single item inside the cart
export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

// Defines the TypeScript structure of a Cart
export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Defines the schema for cart items
const cartItemSchema = new Schema<ICartItem>(
  {
    // Product added to the cart
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Number of units requested
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Product price when it was added to the cart
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

// Defines the MongoDB schema for carts
const cartSchema = new Schema<ICart>(
  {
    // User who owns this cart
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },

    // Products currently inside the cart
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Reuse the model during Next.js development
const Cart = mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
