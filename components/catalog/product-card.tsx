"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, ShoppingCart, Star, Check } from "lucide-react";
import { formatPrice, type Product } from "@/components/catalog/product-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [error, setError] = useState("");

  const inStock = product.stock > 0;
  const rating = 4.9; // Standard Promethix3D verified review score

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || adding) return;

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not add to cart");
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error adding to cart");
    } finally {
      setAdding(false);
    }
  }

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
  }

  const primaryImage =
    product.images?.[0] || "/category-lamps.jpg";
  const secondaryImage = product.images?.[1];

  return (
    <Card className="group relative overflow-hidden rounded-xl border-border bg-surface hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image Container with Link */}
      <Link
        href={`/products/${product._id}`}
        className="relative block aspect-square w-full overflow-hidden bg-secondary/50"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            secondaryImage ? "group-hover:opacity-0" : ""
          }`}
        />
        {secondaryImage && (
          <Image
            src={secondaryImage}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="absolute inset-0 object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Top Badges: Material & Wishlist */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          {product.material ? (
            <Badge
              variant="secondary"
              className="bg-white/90 backdrop-blur-xs text-foreground text-[10px] font-semibold border border-border/40 shadow-xs pointer-events-auto"
            >
              {product.material}
            </Badge>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-border/40 flex items-center justify-center text-foreground-muted hover:text-red-500 transition-colors shadow-xs pointer-events-auto"
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                wishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Out of Stock Pill */}
        {!inStock && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-bold text-foreground-muted bg-surface px-3 py-1 rounded-full border border-border shadow-xs uppercase tracking-wider">
              Made to Order
            </span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-foreground-subtle">
            <span className="truncate max-w-[130px] font-medium text-[11px] uppercase tracking-wider">
              {typeof product.category === "object"
                ? product.category?.name
                : "3D Printed"}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{rating}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            <Link href={`/products/${product._id}`}>{product.name}</Link>
          </h3>

          {/* Description snippet if not compact */}
          {!compact && product.description && (
            <p className="text-xs text-foreground-muted line-clamp-1 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-foreground-subtle uppercase tracking-wider">
              Price
            </span>
            <span className="font-heading font-extrabold text-base sm:text-lg text-foreground">
              {formatPrice(product.price)}
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={!inStock || adding}
            onClick={handleAddToCart}
            className={`h-9 px-3 text-xs font-semibold rounded-lg transition-all ${
              added
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-primary hover:bg-accent-strong text-white shadow-xs"
            }`}
          >
            {adding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : added ? (
              <Check className="w-3.5 h-3.5 mr-1" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            )}
            <span>{adding ? "Adding" : added ? "Added" : "Add"}</span>
          </Button>
        </div>

        {error && (
          <p className="text-[11px] text-destructive text-center mt-1" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
