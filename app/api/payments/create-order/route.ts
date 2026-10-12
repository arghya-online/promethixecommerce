import Razorpay from "razorpay";
import { auth } from "@/src/lib/auth";
import { connectDB } from "@/src/lib/db";
import Order from "@/src/models/order.model";
import { error } from "console";

//Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

//Create a Razorpay Pyment Order
export async function POST(req: Request) {
  try {
    //Authenticate the user
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    await connectDB();

    //Read the existing order from the request body

    const body = await req.json();
    const { orderId } = body;

    if (typeof orderId !== "string") {
      return new Response(JSON.stringify({ message: "Invalid orderId" }), {
        status: 400,
      });
    }

    //Find the order in the database belonging to the authenticated user

    const order = await Order.findOne({ _id: orderId, user: session.user.id });

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    //Prevent duplicate payment order creation if the order is already paid
    if (order.isPaid) {
      return new Response(
        JSON.stringify({ message: "Order is already paid" }),
        {
          status: 400,
        },
      );
    }

    //Razorpay order creation options
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: "INR",
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        userId: session.user.id,
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return Response.json({
      success: true,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order._id,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return Response.json(
      { success: false, message: "Failed to create payment order" },
      { status: 500 },
    );
  }
}
