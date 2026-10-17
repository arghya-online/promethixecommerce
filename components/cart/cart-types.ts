import type { Product } from "@/components/catalog/product-types";

export type CartItem = {
  product: Product;
  quantity: number;
  price: number;
};

export type Cart = {
  items: CartItem[];
};
