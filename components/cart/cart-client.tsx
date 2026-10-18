"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { formatPrice } from "@/components/catalog/product-types";
import type { Cart } from "@/components/cart/cart-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartClient() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState("");
  const [error, setError] = useState("");
  const [requiresSignIn, setRequiresSignIn] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();

      if (res.status === 401) {
        setRequiresSignIn(true);
        setCart(null);
        setError("Please sign in to view and manage your cart.");
        return;
      }

      if (!res.ok && res.status !== 404) {
        throw new Error(data.message || "Could not load cart.");
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
    void loadCart();
  }, [loadCart]);

  const items = useMemo(
    () => (cart?.items ?? []).filter((item) => Boolean(item.product)),
    [cart],
  );

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = 0; // Free / included shipping
  const total = subtotal + shipping;

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;

    setBusyProductId(productId);
    setError("");

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not update quantity.");
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
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
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
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1">
        {/* Cart Header Band */}
        <section className="bg-gradient-to-b from-[#eee8dc]/80 via-[#f7f4ed]/50 to-background border-b border-border py-8 bg-cad-grid relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-72 h-36 bg-radial-warmth pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors group mb-3"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Continue Shopping</span>
            </Link>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
              Shopping Cart
            </h1>
          </div>
        </section>

        {/* Cart Content Section */}
        <section className="py-8 md:py-14 bg-background bg-cad-dots">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-5 bg-surface border border-border rounded-xl flex gap-4"
                  >
                    <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : requiresSignIn ? (
            <Card className="max-w-md mx-auto text-center p-8 bg-surface border-border space-y-5 rounded-2xl shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="font-heading font-bold text-xl text-foreground">
                  Sign in to view your cart
                </h2>
                <p className="text-xs text-foreground-muted">
                  Log in to your Promethix3D account to see your saved items and proceed to checkout.
                </p>
              </div>
              <Button asChild className="w-full bg-primary hover:bg-accent-strong text-white font-semibold">
                <Link href="/login?redirect=/cart">Sign In</Link>
              </Button>
            </Card>
          ) : items.length === 0 ? (
            <Card className="text-center py-16 px-6 bg-surface border border-dashed border-border rounded-2xl space-y-4 max-w-xl mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-secondary text-foreground-subtle mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="font-heading font-bold text-xl text-foreground">
                  Your cart is empty
                </h2>
                <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                  Explore our ready-made lithophane lamps, figurines, and décor, or book a custom print consultation.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild className="bg-primary hover:bg-accent-strong text-white font-semibold">
                  <Link href="/shop">Browse Storefront</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/custom-orders">Custom Order</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const pid = item.product._id;
                  const isBusy = busyProductId === pid;
                  const itemImage =
                    item.product?.images?.[0] || "/category-lamps.jpg";

                  return (
                    <Card
                      key={pid}
                      className="bg-surface border-border overflow-hidden rounded-xl p-4 sm:p-5 shadow-xs"
                    >
                      <div className="flex gap-4 sm:gap-6 items-start">
                        {/* Image */}
                        <Link
                          href={`/products/${pid}`}
                          className="relative w-22 h-22 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-secondary shrink-0 border border-border"
                        >
                          <Image
                            src={itemImage}
                            alt={item.product?.name || "Product"}
                            fill
                            sizes="112px"
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-heading font-bold text-sm sm:text-base text-foreground truncate hover:text-primary transition-colors">
                                <Link href={`/products/${pid}`}>
                                  {item.product?.name}
                                </Link>
                              </h3>
                              {item.product?.material && (
                                <p className="text-xs text-foreground-muted">
                                  {item.product.material}
                                </p>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={isBusy}
                              onClick={() => removeItem(pid)}
                              className="text-foreground-muted hover:text-destructive h-8 w-8"
                              aria-label="Remove item from cart"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Price & Quantity stepper */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <span className="font-heading font-extrabold text-base text-foreground">
                              {formatPrice(item.price * item.quantity)}
                            </span>

                            <div className="inline-flex items-center bg-background border border-border rounded-lg shadow-xs">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                disabled={item.quantity <= 1 || isBusy}
                                onClick={() =>
                                  updateQuantity(
                                    pid,
                                    item.quantity - 1,
                                  )
                                }
                                className="h-7 w-7 text-foreground"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-xs font-bold font-mono">
                                {isBusy ? (
                                  <Loader2 className="w-3 h-3 animate-spin mx-auto text-primary" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                disabled={
                                  item.quantity >= (item.product?.stock ?? 99) ||
                                  isBusy
                                }
                                onClick={() =>
                                  updateQuantity(
                                    pid,
                                    item.quantity + 1,
                                  )
                                }
                                className="h-7 w-7 text-foreground"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {error && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    {error}
                  </p>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="space-y-4 lg:sticky lg:top-24">
                <Card className="bg-surface border-border rounded-xl p-6 shadow-xs space-y-5">
                  <h2 className="font-heading font-bold text-lg text-foreground pb-3 border-b border-border">
                    Order Summary
                  </h2>

                  <div className="space-y-2.5 text-xs text-foreground-muted">
                    <div className="flex justify-between">
                      <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Tracked Shipping (Pan-India)</span>
                      <span className="font-semibold text-emerald-600">
                        FREE
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shockproof Foam Packaging</span>
                      <span className="font-semibold text-emerald-600">
                        Included
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-baseline">
                    <span className="font-heading font-bold text-base text-foreground">
                      Total
                    </span>
                    <span className="font-heading font-black text-2xl text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-primary hover:bg-accent-strong text-white font-semibold h-12 shadow-xs"
                  >
                    <Link href="/checkout" className="flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>

                  <div className="pt-2 space-y-2 text-[11px] text-foreground-subtle border-t border-border/80">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Secured with Razorpay encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Dispatch within 24–48 hours from Kolkata</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
        </section>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
