import { requireAdmin } from "@/src/lib/auth/require-admin";
import { connectDB } from "@/src/lib/db";
import Order from "@/src/models/order.model";
import Product from "@/src/models/products.model";

// Admin Manual Order Creation API
export async function POST(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized || !adminCheck.session) {
    return Response.json(
      { success: false, message: adminCheck.message || "Unauthorized" },
      { status: adminCheck.status || 401 },
    );
  }

  try {
    await connectDB();
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      city,
      addressLine,
      postalCode,
      items,
      paymentMethod = "cash",
      paymentStatus = "paid",
      orderStatus = "confirmed",
      shippingCost = 0,
      notes = "",
    } = body;

    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return Response.json(
        { success: false, message: "Customer name is required" },
        { status: 400 },
      );
    }

    if (!customerPhone || typeof customerPhone !== "string" || !customerPhone.trim()) {
      return Response.json(
        { success: false, message: "Customer phone is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json(
        { success: false, message: "At least one order item is required" },
        { status: 400 },
      );
    }

    // Process items and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const price = Number(item.price) || 0;
      const quantity = Math.max(Number(item.quantity) || 1, 1);

      if (!name) {
        return Response.json(
          { success: false, message: "Each item must have a valid name" },
          { status: 400 },
        );
      }

      if (price < 0) {
        return Response.json(
          { success: false, message: "Item price cannot be negative" },
          { status: 400 },
        );
      }

      subtotal += price * quantity;

      // If tied to a product from catalog, optionally decrement stock
      let productRef = null;
      if (item.productId && typeof item.productId === "string") {
        const prod = await Product.findById(item.productId);
        if (prod) {
          productRef = prod._id;
          await Product.findByIdAndUpdate(prod._id, {
            $inc: { stock: -quantity },
          });
        }
      }

      orderItems.push({
        product: productRef,
        name,
        price,
        quantity,
      });
    }

    const shipCost = Math.max(Number(shippingCost) || 0, 0);
    const total = subtotal + shipCost;

    // Create the order in MongoDB
    const order = await Order.create({
      user: adminCheck.session.user.id,
      items: orderItems,
      shippingAddress: {
        fullName: customerName.trim(),
        phone: customerPhone.trim(),
        houseNumber: "Studio/Direct",
        addressLine1: (addressLine && addressLine.trim()) || "Studio Walk-in / Direct Client",
        addressLine2: customerEmail ? `Email: ${customerEmail.trim()}` : "",
        landmark: "Direct Studio Transaction",
        locationDetails: (notes && notes.trim()) || "Admin Manual Entry",
        city: (city && city.trim()) || "Kolkata",
        state: "West Bengal",
        postalCode: (postalCode && postalCode.trim()) || "700001",
        country: "India",
      },
      subtotal,
      shippingCost: shipCost,
      total,
      paymentMethod,
      paymentStatus,
      orderStatus,
      inventoryReserved: true,
    });

    return Response.json(
      {
        success: true,
        message: "Manual order created and revenue updated successfully.",
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin create order error:", error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create manual order",
      },
      { status: 500 },
    );
  }
}
