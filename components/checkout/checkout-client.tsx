"use client";

import { ArrowLeft, Check, LockKey, Spinner } from "@phosphor-icons/react";
import Link from "next/link";
import Script from "next/script";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/components/catalog/product-types";
import type { Cart } from "@/components/cart/cart-types";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

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
          throw new Error(
            response.status === 401
              ? "Sign in to continue to checkout."
              : data.message,
          );
        }
        if (active) setCart(data.cart);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load your cart.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const subtotal = useMemo(
    () =>
      cart?.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ) ?? 0,
    [cart],
  );
  const total = subtotal;

  function updateAddress(field: keyof ShippingAddress, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function validateAddress() {
    const missing = requiredFields.filter((field) => !address[field].trim());
    if (missing.length > 0) {
      setError("Please complete all required shipping fields.");
      return false;
    }
    if (address.phone.trim().length < 10) {
      setError("Please enter a valid phone number.");
      return false;
    }
    if (address.postalCode.trim().length < 4) {
      setError("Please enter a valid postal code.");
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

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || paymentState === "success" || !validateAddress()) return;
    // Allow retry if a DB order already exists (pendingOrderId set) even if cart appears empty
    if (!pendingOrderId && !cart?.items.length) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setPaymentState("processing");
    setError("");

    // Track whether we successfully handed off to the Razorpay modal.
    // If we throw before that point we reset submitting ourselves.
    // After razorpay.open() the handler/ondismiss callbacks own that state.
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
          throw new Error(orderData.message || "Could not create your order.");
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
        throw new Error("Payment checkout is unavailable. Please try again.");
      }

      const razorpay = new window.Razorpay({
        amount: paymentData.payment.amount,
        currency: paymentData.payment.currency,
        description: "Promethix3D order",
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
            setError(
              "Payment was cancelled. You can retry payment from this page.",
            );
            setSubmitting(false);
          },
        },
        name: "Promethix3D",
        order_id: paymentData.payment.razorpayOrderId,
        prefill: { contact: address.phone, name: address.fullName },
        theme: { color: "#b55335" },
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
      // Only reset submitting if we never handed off to the Razorpay modal.
      // If the modal was opened, its handler/ondismiss callbacks own this state.
      if (!modalOpened) {
        setSubmitting(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <Container>
          <div className="detail-loading" role="status">
            Loading checkout…
          </div>
        </Container>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <Container>
          <div className="detail-state" role="alert">
            <p>{error}</p>
            <Link href="/cart" className="button button-secondary">
              Back to cart
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (paymentState === "success") {
    return (
      <div className="site-shell">
        <SiteHeader />
        <Container>
          <div className="checkout-success">
            <Check size={30} aria-hidden="true" />
            <p className="eyebrow">Payment verified</p>
            <h1 className="font-heading">Thank you for your order.</h1>
            <p>
              Your payment has been verified and your order is being prepared.
            </p>
            <Link href="/shop" className="button button-primary">
              Continue shopping
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (!cart?.items.length && !pendingOrderId) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <Container>
          <div className="cart-state">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="button button-primary">
              Shop products
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <SiteHeader />
      <main>
        <section className="page-intro-section">
          <Container>
            <Link href="/cart" className="back-link">
              <ArrowLeft size={17} aria-hidden="true" /> Back to cart
            </Link>
            <p className="eyebrow checkout-eyebrow">Secure checkout</p>
            <h1 className="font-heading page-title">Complete your order.</h1>
          </Container>
        </section>

        <section className="checkout-content">
          <Container className="checkout-layout">
            <form className="checkout-form" onSubmit={placeOrder}>
              <fieldset disabled={submitting}>
                <legend className="font-heading form-section-title">
                  Shipping details
                </legend>
                <div className="form-grid">
                  <label className="form-field form-field-wide">
                    Full name *
                    <input
                      value={address.fullName}
                      onChange={(event) =>
                        updateAddress("fullName", event.target.value)
                      }
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="form-field">
                    Phone *
                    <input
                      value={address.phone}
                      onChange={(event) =>
                        updateAddress("phone", event.target.value)
                      }
                      autoComplete="tel"
                      inputMode="tel"
                      required
                    />
                  </label>
                  <label className="form-field">
                    House / flat number *
                    <input
                      value={address.houseNumber}
                      onChange={(event) =>
                        updateAddress("houseNumber", event.target.value)
                      }
                      autoComplete="address-line1"
                      required
                    />
                  </label>
                  <label className="form-field">
                    Country *
                    <input
                      value={address.country}
                      onChange={(event) =>
                        updateAddress("country", event.target.value)
                      }
                      autoComplete="country-name"
                      required
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    Street / area address *
                    <input
                      value={address.addressLine1}
                      onChange={(event) =>
                        updateAddress("addressLine1", event.target.value)
                      }
                      autoComplete="address-line1"
                      required
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    Address line 2
                    <input
                      value={address.addressLine2}
                      onChange={(event) =>
                        updateAddress("addressLine2", event.target.value)
                      }
                      autoComplete="address-line2"
                    />
                  </label>
                  <label className="form-field">
                    City *
                    <input
                      value={address.city}
                      onChange={(event) =>
                        updateAddress("city", event.target.value)
                      }
                      autoComplete="address-level2"
                      required
                    />
                  </label>
                  <label className="form-field">
                    State *
                    <input
                      value={address.state}
                      onChange={(event) =>
                        updateAddress("state", event.target.value)
                      }
                      autoComplete="address-level1"
                      required
                    />
                  </label>
                  <label className="form-field">
                    Postal code *
                    <input
                      value={address.postalCode}
                      onChange={(event) =>
                        updateAddress("postalCode", event.target.value)
                      }
                      autoComplete="postal-code"
                      inputMode="numeric"
                      required
                    />
                  </label>
                  <label className="form-field">
                    Nearest landmark *
                    <input
                      value={address.landmark}
                      onChange={(event) =>
                        updateAddress("landmark", event.target.value)
                      }
                      placeholder="For example, beside..."
                      required
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    Exact location / delivery directions *
                    <textarea
                      rows={3}
                      value={address.locationDetails}
                      onChange={(event) =>
                        updateAddress("locationDetails", event.target.value)
                      }
                      placeholder="Add gate, building, floor, entrance, or directions for delivery"
                      required
                    />
                  </label>
                </div>
              </fieldset>

              {error ? (
                <p className="feedback feedback-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                className="button button-primary checkout-submit"
                disabled={
                  submitting || (!cart?.items.length && !pendingOrderId)
                }
              >
                {submitting ? (
                  <Spinner className="spin" size={18} aria-hidden="true" />
                ) : (
                  <LockKey size={18} aria-hidden="true" />
                )}
                {submitting ? "Processing…" : "Place order and pay"}
              </button>
              <p className="checkout-payment-note">
                Secure payment is completed through Razorpay. Cards, UPI, net
                banking, and wallets may be available based on your location.
              </p>
              {paymentState === "failure" ? (
                <p className="checkout-retry">
                  Your order may already exist. Retry only if you did not
                  complete payment.
                </p>
              ) : null}
            </form>

            <aside className="summary-card checkout-summary">
              <h2 className="font-heading">Order summary</h2>
              {cart?.items.map((item) => (
                <div className="checkout-item" key={item.product._id}>
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </aside>
          </Container>
        </section>
      </main>
    </div>
  );
}
