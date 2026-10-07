import mongoose, { Document, Schema } from "mongoose";

// Defines the structure of an item inside an order
export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

// Defines the shipping address stored with the order
export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Defines the TypeScript structure of an Order
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// Schema for individual order items
const orderItemSchema = new Schema<IOrderItem>(
  {
    // Product reference
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Product name snapshot at the time of purchase
    name: {
      type: String,
      required: true,
    },

    // Product price snapshot at the time of purchase
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Quantity purchased
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

// Schema for the shipping address
const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },
  },
  {
    _id: false,
  },
);

// Defines the MongoDB schema for orders
const orderSchema = new Schema<IOrder>(
  {
    // User who placed the order
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Products purchased in the order
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    // Shipping information for the order
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // Total before shipping
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // Shipping charge
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Final amount
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment state
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Fulfillment state
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Reuse the model during Next.js development
const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
