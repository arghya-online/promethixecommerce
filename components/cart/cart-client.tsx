"use client";

import {
  ArrowRight,
  CheckCircle,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkle,
  Trash,
  Truck,
} from "@phosphor-icons/react";
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
  const [requiresSignIn, setRequiresSignIn] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      const data = await response.json();

      if (response.status === 401) {
        setRequiresSignIn(true);
        setCart(null);
        setError("Sign in to view and manage your cart.");
        return;
      }

      if (!response.ok && response.status !== 404) {
        throw new Error(data.message || "Could not load your cart.");
      }

      setRequiresSignIn(false);
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
    const request = window.setTimeout(() => void loadCart(), 0);
    return () => window.clearTimeout(request);
  }, [loadCart]);

  // A product may have been deleted after it was added to the cart.
  const items = useMemo(
    () => (cart?.items ?? []).filter((item) => Boolean(item.product)),
    [cart],
  );

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;

    setBusyProductId(productId);
    setError("");

    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
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
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
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

      <main className="cart-page">
        <section className="cart-intro">
          <Container>
            <div className="cart-breadcrumb" aria-label="Breadcrumb">
              <Link href="/shop">Shop</Link>
              <span aria-hidden="true">/</span>
              <span>Shopping cart</span>
            </div>

            <div className="cart-intro-row">
              <div className="cart-intro-copy">
                <p className="eyebrow">A FEW GOOD THINGS</p>
                <h1 className="font-heading page-title">
                  Your cart<span>.</span>
                </h1>
                <p className="cart-intro-description">
                  Take another look at your picks. Your next little piece of
                  imagination is almost ready to be made real.
                </p>
              </div>

              <div className="cart-intro-mark" aria-hidden="true">
                <ShoppingBag size={34} weight="light" />
                <span>
                  Made to
                  <br />
                  make you smile.
                </span>
              </div>
            </div>

            {!loading && !requiresSignIn && items.length > 0 && (
              <div className="cart-count-line">
                <span className="cart-count-dot" />
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
              </div>
            )}
          </Container>
        </section>

        <section className="cart-content">
          <Container>
            {loading ? (
              <div
                className="cart-layout cart-layout-loading"
                aria-label="Loading cart"
              >
                <div className="cart-list">
                  <CartSkeleton />
                  <CartSkeleton />
                </div>
                <div
                  className="summary-card summary-skeleton"
                  aria-hidden="true"
                >
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line-short" />
                  <div className="skeleton-block" />
                </div>
              </div>
            ) : requiresSignIn ? (
              <div className="cart-state cart-state-enhanced" role="status">
                <div className="cart-state-icon">
                  <ShoppingBag size={30} weight="light" />
                </div>
                <p className="eyebrow">YOUR PICKS ARE WAITING</p>
                <h2 className="font-heading">Sign in to see your cart.</h2>
                <p>
                  Access your saved selection and continue where you left off.
                </p>
                <Link href="/login" className="button button-primary">
                  Sign in <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/shop" className="cart-text-link">
                  Or keep exploring the shop
                </Link>
              </div>
            ) : error && !cart ? (
              <div className="cart-state cart-state-enhanced" role="alert">
                <div className="cart-state-icon">
                  <Package size={30} weight="light" />
                </div>
                <h2 className="font-heading">Your cart couldn't load.</h2>
                <p>{error}</p>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => void loadCart()}
                >
                  Try again <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="cart-state cart-state-enhanced cart-empty-state">
                <div className="cart-state-icon">
                  <ShoppingBag size={32} weight="light" />
                </div>
                <p className="eyebrow">ROOM FOR SOMETHING GOOD</p>
                <h2 className="font-heading">
                  Your cart is taking a little break.
                </h2>
                <p>
                  Explore custom prints, thoughtful gifts, figurines, and clever
                  little creations made to bring ideas to life.
                </p>
                <Link href="/shop" className="button button-primary">
                  Explore the collection{" "}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <div className="cart-empty-notes">
                  <span>
                    <Sparkle size={17} /> Thoughtful designs
                  </span>
                  <span>
                    <Package size={17} /> Made with care
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="cart-section-intro">
                  <div>
                    <p className="eyebrow">YOUR SELECTION</p>
                    <h2 className="font-heading">Looking good so far.</h2>
                  </div>
                  <Link href="/shop" className="cart-continue-link">
                    Keep browsing <ArrowRight size={17} />
                  </Link>
                </div>

                <div className="cart-layout">
                  <div className="cart-list-column">
                    <div className="cart-list">
                      {items.map((item) => {
                        const product = item.product;
                        const productId = product._id;
                        const busy = busyProductId === productId;
                        const maxQuantity = product.stock;

                        return (
                          <article
                            className={`cart-item ${busy ? "cart-item-busy" : ""}`}
                            key={productId}
                          >
                            <Link
                              href={`/products/${productId}`}
                              className="cart-item-image"
                              aria-label={`View ${product.name}`}
                            >
                              <ProductImage product={product} />
                            </Link>

                            <div className="cart-item-details">
                              <div className="cart-item-heading">
                                <div className="cart-item-copy">
                                  <p className="cart-item-kicker">
                                    PROMETHIX3D COLLECTION
                                  </p>
                                  <h3>
                                    <Link href={`/products/${productId}`}>
                                      {product.name}
                                    </Link>
                                  </h3>
                                  <p className="cart-item-unit-price">
                                    {formatPrice(item.price)} <span>each</span>
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  className="remove-item"
                                  onClick={() => void removeItem(productId)}
                                  disabled={busy}
                                  aria-label={`Remove ${product.name} from cart`}
                                >
                                  <Trash size={18} aria-hidden="true" />
                                  <span>Remove</span>
                                </button>
                              </div>

                              <div className="cart-item-footer">
                                <div className="cart-quantity-wrap">
                                  <span className="cart-control-label">
                                    Quantity
                                  </span>
                                  <div
                                    className="quantity-control"
                                    aria-label={`Quantity for ${product.name}`}
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
                                      <Minus size={15} aria-hidden="true" />
                                    </button>
                                    <span aria-live="polite">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateQuantity(
                                          productId,
                                          item.quantity + 1,
                                        )
                                      }
                                      disabled={
                                        busy || item.quantity >= maxQuantity
                                      }
                                      aria-label="Increase quantity"
                                    >
                                      <Plus size={15} aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>

                                <div className="cart-item-line-total">
                                  <span>Item total</span>
                                  <strong>
                                    {formatPrice(item.price * item.quantity)}
                                  </strong>
                                </div>
                              </div>

                              {item.quantity > maxQuantity && (
                                <p
                                  className="feedback feedback-error"
                                  role="alert"
                                >
                                  Stock has changed. Reduce the quantity before
                                  checkout.
                                </p>
                              )}
                            </div>
                          </article>
                        );
                      })}

                      {error && (
                        <p className="feedback feedback-error" role="alert">
                          {error}
                        </p>
                      )}
                    </div>

                    <div className="cart-reassurance-strip">
                      <div className="cart-reassurance-icon">
                        <Sparkle size={20} weight="light" />
                      </div>
                      <div>
                        <h3>Made for your kind of imagination.</h3>
                        <p>
                          Need a custom size, design, or bulk quantity? We can
                          discuss a made-to-order solution.
                        </p>
                        <Link href="/custom-orders">
                          Explore custom orders <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <aside className="summary-card">
                    <div className="summary-heading-row">
                      <div>
                        <p className="eyebrow">THE DETAILS</p>
                        <h2 className="font-heading">Order summary</h2>
                      </div>
                      <span className="summary-item-count">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <div className="summary-items-preview">
                      {items.map((item) => (
                        <div
                          className="summary-preview-row"
                          key={item.product._id}
                        >
                          <span>
                            {item.product.name} <small>× {item.quantity}</small>
                          </span>
                          <strong>
                            {formatPrice(item.price * item.quantity)}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="summary-row summary-shipping-row">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>

                    <div className="summary-total">
                      <span>Estimated total</span>
                      <strong>{formatPrice(total)}</strong>
                    </div>
                    <p className="summary-disclaimer">
                      Shipping charges, if applicable, will be shown before you
                      place your order.
                    </p>

                    <Link
                      href="/checkout"
                      className="button button-primary summary-button"
                    >
                      Continue to checkout{" "}
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>

                    <div className="summary-assurances">
                      <div>
                        <ShieldCheck size={18} />
                        <span>Secure checkout</span>
                      </div>
                      <div>
                        <Truck size={18} />
                        <span>Delivery details at checkout</span>
                      </div>
                      <div>
                        <CheckCircle size={18} />
                        <span>Review before you pay</span>
                      </div>
                    </div>

                    <p className="summary-help">
                      Questions about your order?{" "}
                      <a href="mailto:promethix3d@gmail.com">Talk to us</a>.
                    </p>
                  </aside>
                </div>
              </>
            )}
          </Container>
        </section>
      </main>
    </div>
  );
}
