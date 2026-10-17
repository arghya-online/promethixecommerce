"use client";

import { ArrowLeft, Minus, Plus, ShoppingBagOpen } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/catalog/product-image";
import { formatPrice, type Product } from "@/components/catalog/product-types";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [buying, setBuying] = useState(false);
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
        if (active) setError(reason instanceof Error ? reason.message : "Product could not be loaded");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const maxQuantity = product?.stock ?? 1;
  const unavailable = !product || product.stock < 1;

  async function addToCart() {
    if (!product || quantity < 1 || quantity > product.stock) return;

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
        throw new Error(data.message || "Could not add this product to your cart.");
      }

      setFeedback(`${product.name} added to your cart.`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not add this product to your cart.");
    } finally {
      setAdding(false);
    }
  }

  async function buyNow() {
    if (!product || unavailable || adding || buying) return;
    setBuying(true);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, quantity }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not add this product.");
      router.push("/checkout");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not start checkout.");
      setBuying(false);
    }
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        {loading ? (
          <Container>
            <div className="detail-loading" role="status">Loading product…</div>
          </Container>
        ) : error || !product ? (
          <Container>
            <div className="detail-state" role="alert">
              <p>{error || "Product not found."}</p>
              <Link href="/shop" className="button button-secondary">Back to shop</Link>
            </div>
          </Container>
        ) : (
          <Container>
            <Link href="/shop" className="back-link">
              <ArrowLeft size={17} aria-hidden="true" /> Back to shop
            </Link>
            <div className="product-detail">
              <div className="product-detail-image">
                <ProductImage product={product} priority imageIndex={imageIndex} />
                {product.images.length > 1 ? (
                  <div className="product-thumbnails" aria-label="Product images">
                    {product.images.map((image, index) => (
                      <button
                        type="button"
                        className={index === imageIndex ? "product-thumbnail is-active" : "product-thumbnail"}
                        key={`${image}-${index}`}
                        onClick={() => setImageIndex(index)}
                        aria-label={`View product image ${index + 1}`}
                        aria-pressed={index === imageIndex}
                      >
                        <Image
                          src={image}
                          alt=""
                          aria-hidden="true"
                          height={160}
                          unoptimized
                          width={160}
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="product-detail-copy">
                <p className="eyebrow">
                  {typeof product.category === "object" ? product.category.name : "Promethix3D"}
                </p>
                <h1 className="font-heading product-detail-title">{product.name}</h1>
                <p className="product-detail-price">{formatPrice(product.price)}</p>
                <div className="product-description">
                  <p>{product.description}</p>
                </div>
                <dl className="product-specs">
                  <div><dt>Dimensions</dt><dd>{product.dimensions || "Made to order"}</dd></div>
                  <div><dt>Material</dt><dd>{product.material || "Selected for the design"}</dd></div>
                  <div><dt>Category</dt><dd>{typeof product.category === "object" ? product.category.name : "Promethix3D collection"}</dd></div>
                </dl>
                <div className={`stock-status ${product.stock > 0 ? "" : "is-unavailable"}`}>
                  {product.stock > 0 ? `${product.stock} available` : "Currently unavailable"}
                </div>
                <div className="purchase-row">
                  <div className="quantity-control" aria-label="Quantity">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      disabled={quantity <= 1 || adding}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} aria-hidden="true" />
                    </button>
                    <span aria-live="polite">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                      disabled={quantity >= maxQuantity || adding}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="button button-secondary buy-now-button"
                      disabled={unavailable || adding || buying}
                      onClick={() => void buyNow()}
                    >
                      {buying ? "Opening checkout…" : "Buy now"}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="button button-primary add-to-cart-button"
                    disabled={unavailable || adding}
                    onClick={() => void addToCart()}
                  >
                    <ShoppingBagOpen size={18} aria-hidden="true" />
                    {adding ? "Adding…" : "Add to cart"}
                  </button>
                </div>
                {feedback ? <p className="feedback feedback-success" role="status">{feedback}</p> : null}
                {error ? <p className="feedback feedback-error" role="alert">{error}</p> : null}
              </div>
            </div>
          </Container>
        )}
      </main>
    </div>
  );
}
