"use client";

import {
  ArrowClockwise,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  Package,
  SignOut,
  Spinner,
  ShoppingBag,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/components/catalog/product-types";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";
import { authClient } from "@/src/lib/auth-client";

type Order = {
  _id: string;
  createdAt: string;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
};

function formatStatus(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusClass(value: string) {
  const normalized = value.toLowerCase().replace(/[_\s]/g, "-");

  if (["paid", "completed", "delivered", "success"].includes(normalized)) {
    return "account-status--success";
  }

  if (
    ["pending", "processing", "created", "awaiting-payment"].includes(
      normalized,
    )
  ) {
    return "account-status--pending";
  }

  if (
    ["failed", "cancelled", "canceled", "refunded", "rejected"].includes(
      normalized,
    )
  ) {
    return "account-status--attention";
  }

  return "account-status--neutral";
}

function getOrderIcon(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "delivered" || normalized === "completed") {
    return CheckCircle;
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "failed"
  ) {
    return WarningCircle;
  }

  return Clock;
}

export default function AccountClient() {
  const router = useRouter();
  const session = authClient.useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const user = session.data?.user;

  const loadOrders = useCallback(async (signal?: AbortSignal) => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "We couldn't load your orders.");
      }

      setOrders(data.orders as Order[]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setOrdersError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading your orders.",
      );
    } finally {
      if (!signal?.aborted) {
        setOrdersLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (session.isPending || !user) {
      return;
    }

    const controller = new AbortController();

    void loadOrders(controller.signal);

    return () => controller.abort();
  }, [session.isPending, user, loadOrders]);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    setSignOutError("");

    try {
      await authClient.signOut();
      router.replace("/");
      router.refresh();
    } catch {
      setSignOutError("We couldn't sign you out. Please try again.");
      setSigningOut(false);
    }
  }

  if (session.isPending) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <main className="account-page">
          <Container>
            <div className="account-loading" role="status">
              <Spinner className="spin" size={24} />
              <span>Loading your account</span>
            </div>
          </Container>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <main className="account-page">
          <Container>
            <section className="account-guest">
              <div className="account-guest-icon">
                <ShoppingBag size={30} weight="light" />
              </div>

              <p className="eyebrow">YOUR PROMETHIX3D ACCOUNT</p>

              <h1 className="font-heading">Your creations start here.</h1>

              <p>
                Sign in to view your purchases and keep track of your order
                history.
              </p>

              <Link href="/login" className="button button-primary">
                Sign in to your account
                <ArrowRight size={18} />
              </Link>

              <Link href="/shop" className="account-secondary-link">
                Explore the collection
              </Link>
            </section>
          </Container>
        </main>
      </div>
    );
  }

  const displayName = user.name?.trim() || "there";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const orderCount = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="site-shell">
      <SiteHeader />

      <main className="account-page">
        <section className="account-hero">
          <Container>
            <div className="account-hero-top">
              <div className="account-identity">
                <div className="account-avatar" aria-hidden="true">
                  {initials || "P"}
                </div>

                <div className="account-identity-copy">
                  <p className="eyebrow">YOUR ACCOUNT</p>
                  <h1 className="font-heading">Hello, {displayName}.</h1>
                  <p className="account-email">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                className="account-signout"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
              >
                {signingOut ? (
                  <Spinner className="spin" size={18} />
                ) : (
                  <SignOut size={18} />
                )}
                <span>{signingOut ? "Signing out" : "Sign out"}</span>
              </button>
            </div>

            {signOutError && (
              <p className="account-inline-error" role="alert">
                {signOutError}
              </p>
            )}

            <div className="account-summary">
              <div className="account-summary-item">
                <span className="account-summary-icon">
                  <Package size={21} weight="light" />
                </span>

                <div>
                  <p className="account-summary-label">Your orders</p>
                  <p className="account-summary-value">
                    {ordersLoading ? "—" : orderCount}
                  </p>
                </div>
              </div>

              <div className="account-summary-divider" />

              <div className="account-summary-item">
                <span className="account-summary-icon">
                  <CreditCard size={21} weight="light" />
                </span>

                <div>
                  <p className="account-summary-label">Order value</p>
                  <p className="account-summary-value">
                    {ordersLoading ? "—" : formatPrice(totalSpent)}
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="account-content">
          <Container>
            <div className="account-section-heading">
              <div>
                <p className="eyebrow">YOUR PURCHASES</p>
                <h2 className="font-heading">Order history</h2>
                <p className="account-section-description">
                  Your purchases, all in one place.
                </p>
              </div>

              <Link href="/shop" className="account-shop-link">
                Continue shopping
                <ArrowRight size={17} />
              </Link>
            </div>

            {ordersLoading ? (
              <div
                className="account-loading account-loading--orders"
                role="status"
              >
                <Spinner className="spin" size={24} />
                <span>Finding your orders...</span>
              </div>
            ) : ordersError ? (
              <div className="account-message" role="alert">
                <span className="account-message-icon account-message-icon--error">
                  <WarningCircle size={25} />
                </span>

                <div className="account-message-copy">
                  <h3>We couldn't load your orders.</h3>
                  <p>{ordersError}</p>

                  <button
                    type="button"
                    className="account-retry-button"
                    onClick={() => void loadOrders()}
                  >
                    <ArrowClockwise size={17} />
                    Try again
                  </button>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="account-empty">
                <div className="account-empty-icon">
                  <ShoppingBag size={32} weight="light" />
                </div>

                <p className="eyebrow">A LITTLE SPACE FOR SOMETHING NEW</p>
                <h3 className="font-heading">
                  Your story starts with a first order.
                </h3>
                <p>
                  Custom creations, thoughtful gifts, and useful little
                  inventions are waiting to be explored.
                </p>

                <Link href="/shop" className="button button-primary">
                  Explore the collection
                  <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const StatusIcon = getOrderIcon(order.orderStatus);

                  const orderDate = new Date(order.createdAt);
                  const validDate = !Number.isNaN(orderDate.getTime());

                  return (
                    <article className="order-card" key={order._id}>
                      <div className="order-card-top">
                        <div className="order-card-reference">
                          <span className="order-card-icon">
                            <Package size={22} weight="light" />
                          </span>

                          <div>
                            <p className="order-card-number">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </p>

                            <p className="order-date">
                              {validDate
                                ? new Intl.DateTimeFormat("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }).format(orderDate)
                                : "Date unavailable"}
                            </p>
                          </div>
                        </div>

                        <div className="order-card-total">
                          <span>Total</span>
                          <strong>{formatPrice(order.total)}</strong>
                        </div>
                      </div>

                      <div className="order-card-statuses">
                        <span
                          className={`account-status ${getStatusClass(order.paymentStatus)}`}
                        >
                          <CreditCard size={15} />
                          Payment: {formatStatus(order.paymentStatus)}
                        </span>

                        <span
                          className={`account-status ${getStatusClass(order.orderStatus)}`}
                        >
                          <StatusIcon size={15} />
                          {formatStatus(order.orderStatus)}
                        </span>
                      </div>

                      <div className="order-card-items">
                        <p className="order-items-heading">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </p>

                        <ul>
                          {order.items.map((item, index) => (
                            <li key={`${item.name}-${index}`}>
                              <span className="order-item-name">
                                {item.name}
                              </span>

                              <span className="order-item-quantity">
                                × {item.quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="account-help">
              <div>
                <p className="account-help-title">Need help with an order?</p>
                <p>
                  Have a question about a purchase or a custom requirement? Get
                  in touch with us.
                </p>
              </div>

              <a
                href="mailto:promethix3d@gmail.com"
                className="account-help-link"
              >
                Contact us
                <ArrowRight size={17} />
              </a>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
