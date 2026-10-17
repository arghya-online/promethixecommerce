import { handleRazorpayWebhook } from "@/src/lib/razorpay-webhook";

export async function POST(request: Request) {
  return handleRazorpayWebhook(request);
}
