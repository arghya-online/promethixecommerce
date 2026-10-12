import { createHmac, timingSafeEqual } from "node:crypto";
import { Types } from "mongoose";
import { auth } from "@/src/lib/auth";
import { connectDB } from "@/src/lib/db";
import Order from "@/src/models/order.model";

// Verify Razorpay payment signature
export async function POST(request: Request) {
  try {
    // Authenticate the customer
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Validate required fields
    if (
      typeof orderId !== "string" ||
      !Types.ObjectId.isValid(orderId) ||
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return Response.json(
        { success: false, message: "Invalid payment data" },
        { status: 400 },
      );
    }

    // Find the customer's order
    const order = await Order.findOne({
      _id: orderId,
      user: session.user.id,
    });

    if (!order) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Prevent duplicate payment verification
    if (order.paymentStatus === "paid") {
      return Response.json(
        { success: true, message: "Order is already paid" },
        { status: 200 },
      );
    }

    // Ensure the Razorpay order belongs to this database order
    if (order.razorpayOrderId !== razorpay_order_id) {
      return Response.json(
        { success: false, message: "Payment order mismatch" },
        { status: 400 },
      );
    }

    // Generate the expected signature using the secret key
    const expectedSignature = createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!,
    )
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare signatures safely
    const signaturesMatch = timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpay_signature, "hex"),
    );

    if (!signaturesMatch) {
      return Response.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 },
      );
    }

    // Mark the order as paid only after signature verification
    order.paymentStatus = "paid";
    await order.save();

    return Response.json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return Response.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 },
    );
  }
}
