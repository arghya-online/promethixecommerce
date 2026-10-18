"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Loader2,
  ShieldCheck,
  Truck,
  CreditCard,
  AlertCircle,
  Package,
} from "lucide-react";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { formatPrice } from "@/components/catalog/product-types";
import type { Cart } from "@/components/cart/cart-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type ShippingAddress = {
  fullName: string;
  phone: string;
  houseNumber: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  locationDetails: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
  prefill: { name: string; contact: string };
  theme: { color: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const initialAddress: ShippingAddress = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "India",
  fullName: "",
  houseNumber: "",
  landmark: "",
  locationDetails: "",
  phone: "",
  postalCode: "",
  state: "",
};

const requiredFields: Array<keyof ShippingAddress> = [
  "fullName",
  "phone",
  "houseNumber",
  "addressLine1",
  "landmark",
  "locationDetails",
  "city",
  "state",
  "postalCode",
  "country",
];

export default function CheckoutClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState("");
  const [paymentState, setPaymentState] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/cart")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load checkout data.");
        }
        if (active) setCart(data.cart);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load checkout data.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(
    () => (cart?.items ?? []).filter((item) => Boolean(item.product)),
    [cart],
  );

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  function handleAddressChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  }

  function validateAddress(): boolean {
    for (const field of requiredFields) {
      if (!address[field].trim()) {
        setError(`Please enter your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`);
        return false;
      }
    }
    if (address.phone.trim().length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }
    if (address.postalCode.trim().length < 4) {
      setError("Please enter a valid postal code.");
      return false;
    }
    if (address.locationDetails.trim().length < 5) {
      setError("Please provide more detail for the exact location (at least 5 characters).");
      return false;
    }
    return true;
  }

  async function verifyPayment(orderId: string, response: RazorpayResponse) {
    const verification = await fetch("/api/payments/create-order/verify", {
      body: JSON.stringify({ orderId, ...response }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await verification.json();
    if (!verification.ok || !data.success) {
      throw new Error(data.message || "Payment verification failed.");
    }
  }

  async function placeOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || paymentState === "success" || !validateAddress()) return;
    if (!pendingOrderId && !cart?.items.length) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setPaymentState("processing");
    setError("");

    let modalOpened = false;

    try {
      let orderId = pendingOrderId;

      if (!orderId) {
        const orderResponse = await fetch("/api/orders", {
          body: JSON.stringify({ shippingAddress: address }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const orderData = await orderResponse.json();
        if (!orderResponse.ok || !orderData.success) {
          throw new Error(orderData.message || "Could not create order.");
        }
        orderId = orderData.order._id;
        setPendingOrderId(orderId);
      }

      const paymentResponse = await fetch("/api/payments/create-order", {
        body: JSON.stringify({ orderId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok || !paymentData.success || !paymentData.payment) {
        throw new Error(paymentData.message || "Could not start payment.");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay gateway is initializing. Please try again in a moment.");
      }

      const razorpay = new window.Razorpay({
        amount: paymentData.payment.amount,
        currency: paymentData.payment.currency,
        description: "Promethix3D 3D Printed Order",
        handler: async (response) => {
          try {
            await verifyPayment(orderId, response);
            setPaymentState("success");
            setCart({ items: [] });
            setPendingOrderId("");
          } catch (reason: unknown) {
            setPaymentState("failure");
            setError(
              reason instanceof Error
                ? reason.message
                : "Payment verification failed.",
            );
          } finally {
            setSubmitting(false);
          }
        },
        key: paymentData.payment.keyId,
        modal: {
          ondismiss: () => {
            setPaymentState("failure");
            setError("Payment was cancelled. You can retry anytime.");
            setSubmitting(false);
          },
        },
        name: "Promethix3D",
        order_id: paymentData.payment.razorpayOrderId,
        prefill: { contact: address.phone, name: address.fullName },
        theme: { color: "#d9531e" },
      });

      modalOpened = true;
      razorpay.open();
    } catch (reason: unknown) {
      setPaymentState("failure");
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not complete checkout.",
      );
      if (!modalOpened) {
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1">
        {/* Checkout Header Band */}
        <section className="bg-gradient-to-b from-[#eee8dc]/80 via-[#f7f4ed]/50 to-background border-b border-border py-8 bg-cad-grid relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-72 h-36 bg-radial-warmth pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors group mb-3"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Cart</span>
            </Link>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
              Secure Checkout
            </h1>
          </div>
        </section>

        {/* Checkout Form & Order Summary Section */}
        <section className="py-8 md:py-14 bg-background bg-cad-dots">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : paymentState === "success" ? (
            <Card className="max-w-xl mx-auto p-8 sm:p-12 text-center bg-surface border-border rounded-2xl shadow-md space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                  Order Confirmed!
                </h2>
                <p className="text-xs sm:text-sm text-foreground-muted">
                  Thank you for your order! We are slicing and queueing your print job in our Kolkata studio. You will receive real-time tracking updates as soon as it dispatches.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild className="w-full sm:w-auto bg-primary hover:bg-accent-strong text-white font-semibold">
                  <Link href="/account">View My Orders</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </Card>
          ) : items.length === 0 && !pendingOrderId ? (
            <Card className="max-w-md mx-auto p-8 text-center bg-surface border-border rounded-2xl space-y-4 shadow-xs">
              <Package className="w-12 h-12 text-foreground-subtle mx-auto" />
              <h2 className="font-heading font-bold text-lg text-foreground">
                Your cart is empty
              </h2>
              <p className="text-xs text-foreground-muted">
                Please add products to your cart before proceeding to checkout.
              </p>
              <Button asChild className="w-full bg-primary hover:bg-accent-strong text-white font-semibold">
                <Link href="/shop">Browse Storefront</Link>
              </Button>
            </Card>
          ) : (
            <form onSubmit={placeOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Shipping Address Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-surface border-border rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                      <Truck className="w-5 h-5 text-primary" />
                      Shipping Details (India)
                    </h2>
                    <p className="text-xs text-foreground-muted mt-1">
                      Enter the address where your shockproof print parcel should be dispatched.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground">
                        Full Name <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="text"
                        name="fullName"
                        value={address.fullName}
                        onChange={handleAddressChange}
                        placeholder="Receiver's name"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground">
                        Phone / Contact Number <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        placeholder="10-digit mobile number for delivery updates"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Flat / House / Building No. <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="text"
                        name="houseNumber"
                        value={address.houseNumber}
                        onChange={handleAddressChange}
                        placeholder="e.g. Flat 4B, Tower 2"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Street / Area / Colony <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="text"
                        name="addressLine1"
                        value={address.addressLine1}
                        onChange={handleAddressChange}
                        placeholder="Street or locality"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Landmark <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="text"
                        name="landmark"
                        value={address.landmark}
                        onChange={handleAddressChange}
                        placeholder="e.g. Near Metro Gate 3"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Exact Location Details <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="text"
                        name="locationDetails"
                        value={address.locationDetails}
                        onChange={handleAddressChange}
                        placeholder="e.g. Opposite Park, 2nd floor"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        City <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="e.g. Kolkata"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        State <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="e.g. West Bengal"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        PIN Code <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="text"
                        name="postalCode"
                        value={address.postalCode}
                        onChange={handleAddressChange}
                        placeholder="6-digit postal code"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Country
                      </label>
                      <Input
                        type="text"
                        name="country"
                        value={address.country}
                        disabled
                        className="bg-secondary/40"
                      />
                    </div>
                  </div>
                </Card>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Order Summary & Pay Action */}
              <div className="space-y-4 lg:sticky lg:top-24">
                <Card className="bg-surface border-border rounded-xl p-6 shadow-xs space-y-5">
                  <h2 className="font-heading font-bold text-lg text-foreground pb-3 border-b border-border">
                    Review Order
                  </h2>

                  {/* Item Breakdown */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.product._id}
                        className="flex justify-between items-start text-xs gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {item.product?.name}
                          </p>
                          <p className="text-[11px] text-foreground-muted">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="font-bold text-foreground shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-xs text-foreground-muted">
                    <div className="flex justify-between">
                      <span>Tracked Express Shipping</span>
                      <span className="font-semibold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shockproof Foam Box</span>
                      <span className="font-semibold text-emerald-600">Included</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-baseline">
                    <span className="font-heading font-bold text-base text-foreground">
                      Total Payable
                    </span>
                    <span className="font-heading font-black text-2xl text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-accent-strong text-white font-semibold h-12 shadow-xs"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Pay {formatPrice(total)} Securely</span>
                      </>
                    )}
                  </Button>

                  <div className="pt-2 space-y-1.5 text-[11px] text-foreground-subtle border-t border-border/80">
                    <p className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>UPI, Cards, NetBanking, Wallets supported</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>256-bit encrypted Razorpay transaction</span>
                    </p>
                  </div>
                </Card>
              </div>
            </form>
          )}
        </div>
        </section>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
