"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/components/catalog/product-types";

export function ProductImage({
  product,
  priority = false,
  className = "",
  imageIndex = 0,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
  imageIndex?: number;
}) {
  const [imageError, setImageError] = useState(false);
  const image = product.images?.[imageIndex];

  if (!image || imageError) {
    return (
      <div className={`product-image-placeholder ${className}`.trim()} aria-label="Product image unavailable">
        <span>Promethix3D</span>
      </div>
    );
  }

  return (
    <Image
      src={image}
      alt={product.name}
      className={`product-image ${className}`.trim()}
      height={1000}
      loading={priority ? "eager" : "lazy"}
      onError={() => setImageError(true)}
      unoptimized
      width={1000}
    />
  );
}
