import { CaretRight, ShoppingBagOpen, Spinner } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductImage } from "@/components/catalog/product-image";
import { formatPrice, type Product } from "@/components/catalog/product-types";

export function ProductCard({ product }: { product: Product }) {
  const availability = product.stock > 0 ? "In stock" : "Currently unavailable";
  const router = useRouter();
  const [busy, setBusy] = useState<"cart" | "buy" | null>(null);
  const [error, setError] = useState("");

  async function purchase(mode: "cart" | "buy") {
    if (product.stock < 1 || busy) return;
    setBusy(mode);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not add this product.");
      if (mode === "buy") router.push("/checkout");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not add this product.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="product-card">
      <Link href={`/products/${product._id}`} className="product-card-image">
        <ProductImage product={product} />
        {product.images?.[1] ? (
          <Image
            src={product.images[1]}
            alt=""
            aria-hidden="true"
            className="product-card-secondary-image"
            height={1000}
            unoptimized
            width={1000}
          />
        ) : null}
      </Link>
      <div className="product-card-copy">
        <div>
          {typeof product.category === "object" && product.category?.name ? (
            <p className="product-card-category">{product.category.name}</p>
          ) : null}
          <h3 className="product-card-title">
            <Link href={`/products/${product._id}`}>{product.name}</Link>
          </h3>
          <p className="product-card-price">{formatPrice(product.price)}</p>
          <div className="product-card-meta">
            {product.material ? <span>{product.material}</span> : null}
            {product.dimensions ? <span>{product.dimensions}</span> : null}
          </div>
          <p className={`product-card-availability ${product.stock > 0 ? "" : "is-unavailable"}`}>{availability}</p>
        </div>
        <Link
          href={`/products/${product._id}`}
          className="product-card-link"
          aria-label={`View ${product.name}`}
        >
          <CaretRight size={18} weight="fill" aria-hidden="true" />
        </Link>
      </div>
      <div className="product-card-actions">
        <button type="button" className="product-card-cart-button" disabled={product.stock < 1 || busy !== null} onClick={() => void purchase("cart")}>
          {busy === "cart" ? <Spinner className="spin" size={15} /> : <ShoppingBagOpen size={15} />}
          {busy === "cart" ? "Adding…" : "Add to cart"}
        </button>
        <button type="button" className="product-card-buy-button" disabled={product.stock < 1 || busy !== null} onClick={() => void purchase("buy")}>
          {busy === "buy" ? "Opening…" : "Buy now"}
        </button>
      </div>
      {error ? <p className="product-card-error" role="alert">{error}</p> : null}
    </article>
  );
}
