export type ProductCategory = {
  _id?: string;
  name?: string;
  slug?: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  dimensions?: string;
  material?: string;
  price: number;
  category: ProductCategory | string;
  images: string[];
  stock: number;
  isActive: boolean;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(price);
}
