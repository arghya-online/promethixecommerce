import mongoose, { Document, Schema } from "mongoose";

export type HomepageBannerSlot = "hero" | "promotion";

export interface IHomepageBanner extends Document {
  slot: HomepageBannerSlot;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const homepageBannerSchema = new Schema<IHomepageBanner>(
  {
    slot: { type: String, enum: ["hero", "promotion"], required: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    image: { type: String, required: true, trim: true },
    href: { type: String, default: "/shop", trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

homepageBannerSchema.index({ slot: 1, sortOrder: 1 });

const HomepageBanner =
  mongoose.models.HomepageBanner ||
  mongoose.model<IHomepageBanner>("HomepageBanner", homepageBannerSchema);

export default HomepageBanner;
