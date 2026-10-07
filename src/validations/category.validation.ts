import { z } from "zod";

// Validation rules for creating a category
export const createCategorySchema = z.object({
  // Category name
  name: z.string().min(1, "Category name is required").trim(),

  // URL-friendly category identifier
  slug: z.string().min(1, "Category slug is required").trim(),

  // Category description
  description: z.string().min(1, "Category description is required").trim(),

  // Optional category image
  image: z.string().url("Invalid image URL").or(z.literal("")).default(""),

  // Whether the category is available
  isActive: z.boolean().default(true),
});

// Validation rules for updating a category
export const updateCategorySchema = createCategorySchema.partial();
