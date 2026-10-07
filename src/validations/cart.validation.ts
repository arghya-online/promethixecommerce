import { z } from "zod";

// Validation rules for adding a product to the cart
export const addToCartSchema = z.object({
  // MongoDB ID of the product
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),

  // Number of units to add
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

// Validation rules for updating cart quantity
export const updateCartItemSchema = z.object({
  // MongoDB ID of the product
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),

  // New quantity
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});
