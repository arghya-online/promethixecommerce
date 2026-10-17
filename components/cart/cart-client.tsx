"use client";

import { ArrowRight, Minus, Plus, Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductImage } from "@/components/catalog/product-image";
import { formatPrice } from "@/components/catalog/product-types";
import type { Cart } from "@/components/cart/cart-types";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

function CartSkeleton() {
  return (
    <div className="cart-skeleton" aria-hidden="true">
      <div className="skeleton-block" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line-short" />
    </div>
  );
}

export default function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState("");
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();

      if (response.status === 401) {
        setError("Sign in to view your cart.");
        setCart({ items: [] });
        return;
      }

      if (!response.ok && response.status !== 404) {
        throw new Error(data.message || "Could not load your cart.");
      }

      setCart(data.cart ?? { items: [] });
      setError("");
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "Could not load your cart.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => {
      void loadCart();
    }, 0);

    return () => window.clearTimeout(request);
  }, [loadCart]);

  const subtotal = useMemo(
    () =>
      cart?.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ) ?? 0,
    [cart],
  );
  const shipping = subtotal >= 2000 ? 0 : subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    setBusyProductId(productId);
    setError("");

    try {
      const response = await fetch("/api/cart", {
        body: JSON.stringify({ productId, quantity }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not update this item.");
      }
      setCart(data.cart);
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not update this item.",
      );
      await loadCart();
    } finally {
      setBusyProductId("");
    }
  }

  async function removeItem(productId: string) {
    setBusyProductId(productId);
    setError("");

    try {
      const response = await fetch("/api/cart", {
        body: JSON.stringify({ productId }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not remove this item.");
      }
      setCart(data.cart);
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not remove this item.",
      );
    } finally {
      setBusyProductId("");
    }
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="page-intro-section">
          <Container>
            <p className="eyebrow">Your selection</p>
            <h1 className="font-heading page-title">Cart</h1>
          </Container>
        </section>

        <section className="cart-content">
          <Container>
            {loading ? (
              <div className="cart-list" aria-label="Loading cart">
                <CartSkeleton />
                <CartSkeleton />
              </div>
            ) : error && !cart ? (
              <div className="cart-state" role="alert">
                <p>{error}</p>
                <Link href="/login" className="button button-primary">
                  Sign in
                </Link>
              </div>
            ) : cart?.items.length === 0 ? (
              <div className="cart-state">
                <p>{error || "Your cart is empty."}</p>
                <Link href="/shop" className="button button-primary">
                  Shop products <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-list">
                  {cart?.items.map((item) => {
                    const productId = item.product._id;
                    const busy = busyProductId === productId;
                    const maxQuantity = item.product.stock;

                    return (
                      <article className="cart-item" key={productId}>
                        <Link
                          href={`/products/${productId}`}
                          className="cart-item-image"
                        >
                          <ProductImage product={item.product} />
                        </Link>
                        <div className="cart-item-details">
                          <div className="cart-item-heading">
                            <div>
                              <h2>
                                <Link href={`/products/${productId}`}>
                                  {item.product.name}
                                </Link>
                              </h2>
                              <p>{formatPrice(item.price)}</p>
                            </div>
                            <button
                              type="button"
                              className="remove-item"
                              onClick={() => void removeItem(productId)}
                              disabled={busy}
                              aria-label={`Remove ${item.product.name}`}
                            >
                              <Trash size={18} aria-hidden="true" />
                            </button>
                          </div>
                          <div className="cart-item-footer">
                            <div
                              className="quantity-control"
                              aria-label={`Quantity for ${item.product.name}`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  void updateQuantity(
                                    productId,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={busy || item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={16} aria-hidden="true" />
                              </button>
                              <span aria-live="polite">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  void updateQuantity(
                                    productId,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={busy || item.quantity >= maxQuantity}
                                aria-label="Increase quantity"
                              >
                                <Plus size={16} aria-hidden="true" />
                              </button>
                            </div>
                            <strong>
                              {formatPrice(item.price * item.quantity)}
                            </strong>
                          </div>
                          {item.quantity > maxQuantity ? (
                            <p className="feedback feedback-error">
                              Stock changed. Please reduce the quantity before
                              checkout.
                            </p>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                  {error ? (
                    <p className="feedback feedback-error" role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>

                <aside className="summary-card">
                  <h2 className="font-heading">Summary</h2>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                  <Link
                    href="/checkout"
                    className="button button-primary summary-button"
                  >
                    Continue to checkout{" "}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <p className="summary-note">
                    Free shipping on orders over ₹2,000.
                  </p>
                </aside>
              </div>
            )}
          </Container>
        </section>
      </main>
    </div>
  );
}
