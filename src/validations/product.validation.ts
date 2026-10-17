import { z } from "zod";

// Validation rules for creating a new product
export const createProductSchema = z.object({
  // Product name
  name: z.string().min(1, "Product name is required").trim(),

  // URL-friendly product identifier
  slug: z.string().min(1, "Product slug is required").trim(),

  // Product description
  description: z.string().min(1, "Product description is required").trim(),
  dimensions: z.string().trim().default(""),
  material: z.string().trim().default(""),

  // Product price
  price: z.number().min(0, "Price cannot be negative"),

  // Number of units currently available
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),

  // Product category
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),

  // Product images
  images: z.array(z.string()).optional(),

  // Whether the product is available
  isActive: z.boolean().default(true),
});

// Validation rules for updating a product
// Every field is optional because PATCH can update only selected fields
export const updateProductSchema = createProductSchema.partial();
