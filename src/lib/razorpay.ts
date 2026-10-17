import Razorpay from "razorpay";

export type RazorpayMode = "test" | "live";

function getRazorpayMode(): RazorpayMode {
  return process.env.RAZORPAY_MODE === "live" ? "live" : "test";
}

export function getRazorpayConfig() {
  const mode = getRazorpayMode();
  const keyId =
    mode === "live"
      ? process.env.RAZORPAY_LIVE_KEY_ID
      : process.env.RAZORPAY_KEY_ID;
  const keySecret =
    mode === "live"
      ? process.env.RAZORPAY_LIVE_KEY_SECRET
      : process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret =
    mode === "live"
      ? process.env.RAZORPAY_LIVE_WEBHOOK_SECRET ??
        process.env.Razorpay_LIVE_WEBHOOK_SECRET
      : process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(`Razorpay ${mode} credentials are not configured`);
  }

  return { mode, keyId, keySecret, webhookSecret };
}

export function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayConfig();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
