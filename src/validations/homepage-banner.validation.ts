import { z } from "zod";

export const homepageBannerSchema = z.object({
  slot: z.enum(["hero", "promotion"]),
  title: z.string().min(1, "Banner title is required").trim(),
  subtitle: z.string().trim().default(""),
  image: z.string().url("Banner image must be a valid URL"),
  href: z.string().trim().default("/shop"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateHomepageBannerSchema = homepageBannerSchema.partial();
