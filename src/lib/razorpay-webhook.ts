import { createHmac, timingSafeEqual } from "node:crypto";
import { Types } from "mongoose";
import { connectDB } from "@/src/lib/db";
import { getRazorpayConfig } from "@/src/lib/razorpay";
import Order, { type IOrderItem } from "@/src/models/order.model";
import PaymentEvent from "@/src/models/payment-event.model";
import Product from "@/src/models/products.model";

type RazorpayPayment = {
  id?: unknown;
  order_id?: unknown;
  notes?: { orderId?: unknown };
  amount?: unknown;
  status?: unknown;
};

type RazorpayOrder = {
  id?: unknown;
  notes?: { orderId?: unknown };
  amount?: unknown;
  status?: unknown;
};

type RazorpayEvent = {
  id?: unknown;
  event?: unknown;
  payload?: {
    payment?: { entity?: RazorpayPayment };
    order?: { entity?: RazorpayOrder };
  };
};

function hasValidSignature(rawBody: string, signature: string, secret: string) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return (
    expected.length === signature.length &&
    timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"))
  );
}

async function restoreInventory(orderId: string) {
  if (!Types.ObjectId.isValid(orderId)) return;

  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      paymentStatus: "failed",
      inventoryReserved: true,
      inventoryRestored: false,
    },
    { $set: { inventoryRestored: true } },
    { new: false },
  );

  if (!order) return;

  await Promise.all(
    order.items.map((item: IOrderItem) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      }),
    ),
  );
}

async function markPaid(orderId: string, paymentId?: string) {
  if (!Types.ObjectId.isValid(orderId)) return;

  await Order.updateOne(
    { _id: orderId, paymentStatus: { $ne: "paid" } },
    {
      $set: {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
      },
    },
  );
}

async function markFailed(orderId: string) {
  if (!Types.ObjectId.isValid(orderId)) return;

  const result = await Order.updateOne(
    { _id: orderId, paymentStatus: { $nin: ["paid", "failed"] } },
    { $set: { paymentStatus: "failed" } },
  );
  if (result.modifiedCount > 0) await restoreInventory(orderId);
}

function getOrderId(event: RazorpayEvent) {
  const payment = event.payload?.payment?.entity;
  const razorpayOrder = event.payload?.order?.entity;
  const notesOrderId = payment?.notes?.orderId ?? razorpayOrder?.notes?.orderId;
  return typeof notesOrderId === "string"
    ? notesOrderId
    : typeof payment?.order_id === "string"
      ? payment.order_id
      : typeof razorpayOrder?.id === "string"
        ? razorpayOrder.id
        : null;
}

export async function handleRazorpayWebhook(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const { webhookSecret } = getRazorpayConfig();

    if (!signature || !webhookSecret) {
      return Response.json(
        { success: false, message: "Webhook configuration error" },
        { status: 500 },
      );
    }
    if (!hasValidSignature(rawBody, signature, webhookSecret)) {
      return Response.json(
        { success: false, message: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    let event: RazorpayEvent;
    try {
      event = JSON.parse(rawBody) as RazorpayEvent;
    } catch {
      return Response.json(
        { success: false, message: "Invalid webhook payload" },
        { status: 400 },
      );
    }

    if (typeof event.id !== "string" || typeof event.event !== "string") {
      return Response.json(
        { success: false, message: "Invalid webhook event" },
        { status: 400 },
      );
    }

    await connectDB();
    try {
      await PaymentEvent.create({ eventId: event.id, event: event.event });
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === 11000) {
        return Response.json({ success: true, duplicate: true });
      }
      throw error;
    }

    const orderId = getOrderId(event);
    const payment = event.payload?.payment?.entity;

    if (orderId) {
      if (event.event === "order.paid" || event.event === "payment.captured") {
        await markPaid(
          orderId,
          typeof payment?.id === "string" ? payment.id : undefined,
        );
      } else if (event.event === "payment.failed") {
        await markFailed(orderId);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return Response.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
