"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { formatPrice, type Product } from "@/components/catalog/product-types";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const router = useRouter();

  useEffect(() => {
    let active = true;

    fetch(`/api/products/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success || !data.product) {
          throw new Error(data.message || "Product could not be loaded");
        }
        if (active) {
          if (data.product.isActive !== true) {
            setError("This product is not currently available.");
          } else {
            setProduct(data.product as Product);
          }
        }
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Product could not be loaded",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const inStock = product && product.stock > 0;
  const maxQuantity = product?.stock ?? 1;

  async function addToCart() {
    if (!product || quantity < 1 || !inStock) return;

    setAdding(true);
    setFeedback("");
    setError("");

    try {
      const response = await fetch("/api/cart", {
        body: JSON.stringify({ productId: product._id, quantity }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not add this product to your cart.",
        );
      }

      setFeedback(`${product.name} added to cart.`);
      setTimeout(() => setFeedback(""), 3500);
      router.refresh();
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not add to cart.",
      );
    } finally {
      setAdding(false);
    }
  }

  async function buyNow() {
    if (!product || !inStock || adding || buying) return;
    setBuying(true);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, quantity }),
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.message || "Could not add this product.");
      router.push("/checkout");
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "Could not start checkout.",
      );
      setBuying(false);
    }
  }

  const images = product?.images?.length
    ? product.images
    : ["/category-lamps.jpg"];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1 bg-gradient-to-b from-[#eee8dc]/70 via-[#f7f4ed]/50 to-background bg-cad-dots relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Storefront</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : error || !product ? (
            <div className="text-center py-20 bg-surface border border-border rounded-2xl p-8 space-y-4 max-w-md mx-auto">
              <p className="text-base font-semibold text-destructive">
                {error || "Product not found."}
              </p>
              <Button asChild variant="outline">
                <Link href="/shop">Return to shop</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
              {/* Product Media Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface border border-border shadow-xs">
                  <Image
                    src={images[imageIndex] || images[0]}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-all duration-300"
                  />
                  {product.material && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/95 text-foreground backdrop-blur-xs shadow-xs text-xs">
                        {product.material}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageIndex(idx)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden bg-surface border-2 transition-all shrink-0 ${
                          imageIndex === idx
                            ? "border-primary shadow-xs scale-105"
                            : "border-border/70 opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`View photo ${idx + 1}`}
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Buy Box & Copy */}
              <div className="space-y-6">
                <div className="space-y-2 border-b border-border/80 pb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      {typeof product.category === "object"
                        ? product.category?.name
                        : "3D Printed Collection"}
                    </span>
                    <Badge
                      variant={inStock ? "secondary" : "outline"}
                      className={
                        inStock
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-xs border-emerald-500/20"
                          : "text-foreground-muted text-xs"
                      }
                    >
                      {inStock ? "In Stock · Ready to Ship" : "Made to Order"}
                    </Badge>
                  </div>

                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground">
                    {product.name}
                  </h1>

                  <div className="pt-2 flex items-baseline gap-3">
                    <span className="font-heading font-black text-3xl sm:text-4xl text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-foreground-muted">
                      Inclusive of all taxes &amp; standard packing
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="text-sm text-foreground-muted leading-relaxed space-y-3">
                  <p>{product.description}</p>
                </div>

                {/* Specs Pill Matrix */}
                <div className="grid grid-cols-2 gap-3 bg-secondary/50 rounded-xl p-4 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                      Material
                    </span>
                    <p className="font-medium text-foreground mt-0.5">
                      {product.material || "Precision PLA+ / Resin"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                      Dimensions
                    </span>
                    <p className="font-medium text-foreground mt-0.5">
                      {product.dimensions || "Engineered to spec"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                      Production Origin
                    </span>
                    <p className="font-medium text-foreground mt-0.5">
                      Kolkata Workshop, India
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                      Packaging
                    </span>
                    <p className="font-medium text-foreground mt-0.5">
                      Shockproof Foam Cradle
                    </p>
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Quantity:
                    </span>
                    <div className="inline-flex items-center bg-surface border border-border rounded-lg shadow-xs">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                        disabled={quantity <= 1 || adding || buying}
                        className="h-8 w-8 text-foreground"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="w-10 text-center text-xs font-bold font-mono">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setQuantity((v) => Math.min(maxQuantity, v + 1))
                        }
                        disabled={quantity >= maxQuantity || adding || buying}
                        className="h-8 w-8 text-foreground"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button
                      type="button"
                      size="lg"
                      disabled={!inStock || adding || buying}
                      onClick={addToCart}
                      className="bg-primary hover:bg-accent-strong text-white font-semibold h-12 shadow-xs"
                    >
                      {adding ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 mr-2" />
                      )}
                      <span>{adding ? "Adding to Cart..." : "Add to Cart"}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      disabled={!inStock || adding || buying}
                      onClick={buyNow}
                      className="border-border bg-surface hover:bg-secondary text-foreground font-semibold h-12"
                    >
                      {buying ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-primary mr-2" />
                      )}
                      <span>{buying ? "Redirecting..." : "Buy Now"}</span>
                    </Button>
                  </div>

                  {/* Notifications */}
                  {feedback && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feedback}</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg">
                      {error}
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-border/80 grid grid-cols-2 gap-4 text-xs text-foreground-muted">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Tracked pan-India shipping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Safe arrival guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
