import mongoose, { Document, Schema } from "mongoose";

export interface ICustomOrder extends Document {
  name: string;
  email: string;
  phone: string;
  projectTitle?: string;
  projectType:
    | "figurine"
    | "gift"
    | "decor"
    | "mechanical"
    | "robotics"
    | "prototype"
    | "other";
  description: string;
  quantity?: string;
  dimensions?: string;
  material?: string;
  colorFinish?: string;
  application?: string;
  timeline?: string;
  budget?: string;
  fileUrls?: string[];
  referenceCode?: string;
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
    projectTitle: {
      type: String,
      trim: true,
      default: "",
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
    quantity: {
      type: String,
      trim: true,
      default: "1",
    },
    dimensions: {
      type: String,
      trim: true,
      default: "",
    },
    material: {
      type: String,
      trim: true,
      default: "",
    },
    colorFinish: {
      type: String,
      trim: true,
      default: "",
    },
    application: {
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
    fileUrls: {
      type: [String],
      default: [],
    },
    referenceCode: {
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

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.CustomOrder;
}

const CustomOrder =
  mongoose.models.CustomOrder ||
  mongoose.model<ICustomOrder>("CustomOrder", customOrderSchema);

export default CustomOrder;
