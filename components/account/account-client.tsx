"use client";

import { ArrowRight, SignOut, Spinner } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  items: Array<{ name: string; quantity: number; price: number }>;
};

export default function AccountClient() {
  const router = useRouter();
  const session = authClient.useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (session.isPending || !session.data) return;
    let active = true;

    fetch("/api/orders")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load your orders.");
        }
        if (active) setOrders(data.orders as Order[]);
      })
      .catch((reason: unknown) => {
        if (active) setOrdersError(reason instanceof Error ? reason.message : "Could not load your orders.");
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session.data, session.isPending]);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  if (session.isPending) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <Container><div className="detail-loading" role="status">Loading account…</div></Container>
      </div>
    );
  }

  if (!session.data) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <Container>
          <div className="account-state">
            <p className="eyebrow">Customer account</p>
            <h1 className="font-heading">Sign in to see your account.</h1>
            <Link href="/login" className="button button-primary">Sign in <ArrowRight size={18} /></Link>
          </div>
        </Container>
      </div>
    );
  }

  const user = session.data.user;

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="page-intro-section">
          <Container className="account-heading">
            <div>
              <p className="eyebrow">Customer account</p>
              <h1 className="font-heading page-title">Hello, {user.name || user.email}.</h1>
              <p className="account-email">{user.email}</p>
            </div>
            <button type="button" className="account-signout" onClick={() => void signOut()} disabled={signingOut}>
              {signingOut ? <Spinner className="spin" size={18} /> : <SignOut size={18} />}
              Sign out
            </button>
          </Container>
        </section>
        <section className="account-content">
          <Container>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Your purchases</p>
                <h2 className="font-heading section-title">Order history</h2>
              </div>
            </div>
            {ordersLoading ? (
              <div className="detail-loading" role="status">Loading orders…</div>
            ) : ordersError ? (
              <div className="account-state compact" role="alert"><p>{ordersError}</p></div>
            ) : orders.length === 0 ? (
              <div className="account-state compact">
                <p>You have not placed an order yet.</p>
                <Link href="/shop" className="text-button">Explore the collection</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <article className="order-card" key={order._id}>
                    <div className="order-card-heading">
                      <div>
                        <p className="order-date">
                          {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(order.createdAt))}
                        </p>
                        <p className="order-id">Order {order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                    <div className="order-card-meta">
                      <span className={`status-tag status-${order.paymentStatus}`}>Payment: {order.paymentStatus}</span>
                      <span className={`status-tag status-${order.orderStatus}`}>{order.orderStatus}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <span key={`${item.name}-${index}`}>{item.name} × {item.quantity}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Container>
        </section>
      </main>
    </div>
  );
}
