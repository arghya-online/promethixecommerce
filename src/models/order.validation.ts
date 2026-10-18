import { z } from "zod";

// Validation rules for the shipping address
const shippingAddressSchema = z.object({
  fullName: z.string().min(2).trim(),
  phone: z.string().min(10).trim(),
  houseNumber: z.string().min(1, "House or flat number is required").trim(),
  addressLine1: z.string().min(1).trim(),
  addressLine2: z.string().trim().optional(),
  landmark: z.string().min(1, "Landmark is required").trim(),
  locationDetails: z.string().min(5, "Exact location details are required").trim(),
  city: z.string().min(1).trim(),
  state: z.string().min(1).trim(),
  postalCode: z.string().min(4).trim(),
  country: z.string().min(1).trim().default("India"),
});

// Validation rules for creating an order
export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["online", "cod"]).default("online").optional(),
});

// Validation rules for admin order status updates
export const updateOrderStatusSchema = z
  .object({
    orderStatus: z
      .enum([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .optional(),
    paymentStatus: z
      .enum(["pending", "paid", "failed", "refunded"])
      .optional(),
  })
  .refine((data) => data.orderStatus !== undefined || data.paymentStatus !== undefined, {
    message: "Either orderStatus or paymentStatus must be provided",
  });

