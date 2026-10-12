import { createHmac, timingSafeEqual } from "crypto";
import { connectDB } from "@/src/lib/db";
import Order from "@/src/models/order.model";

//Handle Razorpay webhooks evnets

export async function POST(req: Request) {
  try {
    //Read raw request body for signature verufication
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Signature missing" }), {
        status: 400,
      });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return Response.json(
        { success: false, message: "Webhook configuration error" },
        { status: 500 },
      );
    }

    //Verify the signature
    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (
      !/^[a-f0-9]{64}$/i.test(signature) ||
      !timingSafeEqual(
        Buffer.from(expectedSignature, "hex"),
        Buffer.from(signature, "hex"),
      )
    ) {
      return Response.json(
        { success: false, message: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    const event = JSON.parse(rawBody);

    await connectDB();

    // Handle successful payment capture
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.notes?.orderId;

      if (typeof orderId === "string") {
        const order = await Order.findById(orderId);

        // Match the payment to the Razorpay order saved in our database
        if (
          order &&
          order.razorpayOrderId === payment.order_id &&
          order.paymentStatus !== "paid"
        ) {
          order.paymentStatus = "paid";
          await order.save();
        }
      }
    }

    // Handle failed payments
    if (event.event === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.notes?.orderId;

      if (typeof orderId === "string") {
        const order = await Order.findById(orderId);

        // Don't overwrite a successful payment with a delayed failure event
        if (
          order &&
          order.razorpayOrderId === payment.order_id &&
          order.paymentStatus === "pending"
        ) {
          order.paymentStatus = "failed";
          await order.save();
        }
      }
    }

    // Acknowledge the event so Razorpay doesn't retry unnecessarily
    return Response.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return Response.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
