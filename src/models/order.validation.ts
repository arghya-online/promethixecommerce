import { z } from "zod";

// Validation rules for the shipping address
const shippingAddressSchema = z.object({
  fullName: z.string().min(2).trim(),
  phone: z.string().min(10).trim(),
  addressLine1: z.string().min(1).trim(),
  addressLine2: z.string().trim().optional(),
  city: z.string().min(1).trim(),
  state: z.string().min(1).trim(),
  postalCode: z.string().min(4).trim(),
  country: z.string().min(1).trim().default("India"),
});

// Validation rules for creating an order
export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
});

// Validation rules for admin order status updates
export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});
