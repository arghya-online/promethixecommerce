import { requireAdmin } from "@/src/lib/auth/require-admin";
import { connectDB } from "@/src/lib/db";
import CustomOrder from "@/src/models/custom-order.model";
import Order from "@/src/models/order.model";
import Product from "@/src/models/products.model";

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return Response.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
  }

  try {
    await connectDB();
    const [orderStats, productStats, recentOrders, pendingRequests] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            paidRevenue: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] },
            },
            pendingOrders: {
              $sum: { $cond: [{ $in: ["$orderStatus", ["pending", "confirmed", "processing"]] }, 1, 0] },
            },
          },
        },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            lowStockProducts: {
              $sum: { $cond: [{ $and: [{ $lte: ["$stock", 5] }, "$isActive"] }, 1, 0] },
            },
          },
        },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6).select("items total paymentStatus orderStatus shippingAddress createdAt razorpayOrderId"),
      CustomOrder.find({ status: { $in: ["new", "reviewing", "quoted", "approved", "in_production"] } }).sort({ createdAt: -1 }).limit(6),
    ]);

    return Response.json({
      success: true,
      stats: {
        totalOrders: orderStats[0]?.totalOrders ?? 0,
        paidRevenue: orderStats[0]?.paidRevenue ?? 0,
        pendingOrders: orderStats[0]?.pendingOrders ?? 0,
        lowStockProducts: productStats[0]?.lowStockProducts ?? 0,
      },
      recentOrders,
      pendingRequests,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return Response.json({ success: false, message: "Failed to load admin overview" }, { status: 500 });
  }
}
