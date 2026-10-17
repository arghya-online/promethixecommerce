import mongoose, { Document, Schema } from "mongoose";

export interface ICustomOrder extends Document {
  name: string;
  email: string;
  phone: string;
  projectType:
    | "figurine"
    | "gift"
    | "decor"
    | "mechanical"
    | "robotics"
    | "prototype"
    | "other";
  description: string;
  dimensions?: string;
  timeline?: string;
  budget?: string;
  status: "new" | "reviewing" | "quoted" | "approved" | "in_production" | "completed" | "rejected" | "cancelled";
  internalNotes?: string;
  quoteAmount?: number | null;
  quoteDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customOrderSchema = new Schema<ICustomOrder>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    projectType: {
      type: String,
      required: true,
      enum: [
        "figurine",
        "gift",
        "decor",
        "mechanical",
        "robotics",
        "prototype",
        "other",
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    dimensions: {
      type: String,
      trim: true,
      default: "",
    },
    timeline: {
      type: String,
      trim: true,
      default: "",
    },
    budget: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["new", "reviewing", "quoted", "approved", "in_production", "completed", "rejected", "cancelled"],
      default: "new",
    },
    internalNotes: { type: String, trim: true, default: "" },
    quoteAmount: { type: Number, min: 0, default: null },
    quoteDetails: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
  },
);

const CustomOrder =
  mongoose.models.CustomOrder ||
  mongoose.model<ICustomOrder>("CustomOrder", customOrderSchema);

export default CustomOrder;
