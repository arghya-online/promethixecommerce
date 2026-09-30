import { z } from "zod";

// Validation rules for creating a new product
export const createProductSchema = z.object({
  // Product name
  name: z.string().min(1, "Product name is required").trim(),

  // URL-friendly product identifier
  slug: z.string().min(1, "Product slug is required").trim(),

  // Product description
  description: z.string().min(1, "Product description is required").trim(),

  // Product price
  price: z.number().min(0, "Price cannot be negative"),

  // Product category
  category: z.string().min(1, "Product category is required").trim(),

  // Product images
  images: z.array(z.string()).optional(),

  // Whether the product is available
  isActive: z.boolean().default(true),
});

// Validation rules for updating a product
// Every field is optional because PATCH can update only selected fields
export const updateProductSchema = createProductSchema.partial();
