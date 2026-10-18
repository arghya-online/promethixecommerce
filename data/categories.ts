export interface CategoryItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  href: string;
  badge: string;
  actionLabel: string;
}

export const categories: CategoryItem[] = [
  {
    id: "lamps",
    name: "Personalised Lamps",
    tagline: "Lithophanes & Ambient Light",
    description: "Custom 3D printed lamps with your photos, text or ambient backlit artwork.",
    image: "/category-lamps.jpg",
    href: "/shop?category=lamps",
    badge: "Personalised",
    actionLabel: "Shop Lamps",
  },
  {
    id: "figurines",
    name: "Figurines & Idols",
    tagline: "Fine-Detail Miniatures & Statues",
    description: "Ultra-sharp deity idols, tabletop miniatures, anime figures and collector display statues.",
    image: "/category-figurines.jpg",
    href: "/shop?category=figurines",
    badge: "High Resolution",
    actionLabel: "See Figurines",
  },
  {
    id: "mechanical",
    name: "Working Parts",
    tagline: "Engineering & Replacement Parts",
    description: "High-strength gears, brackets, hinges and obsolete replacement parts in PETG, ABS and Carbon-Fibre.",
    image: "/category-mechanical.jpg",
    href: "/custom-orders?service=parts",
    badge: "Engineering Grade",
    actionLabel: "Get a Part Made",
  },
  {
    id: "prototypes",
    name: "Prototypes & Inventions",
    tagline: "CAD Design to Physical Proof",
    description: "Test your fit, clearance and ergonomics in your hands before investing in expensive mass-tooling.",
    image: "/category-prototypes.jpg",
    href: "/custom-orders?service=prototype",
    badge: "CAD Help Included",
    actionLabel: "Start a Prototype",
  },
  {
    id: "decor",
    name: "Home & Desk Décor",
    tagline: "Modern Lifestyle Objects",
    description: "Architectural planters, cable organizers, pen holders and minimal desk accessories.",
    image: "/category-decor.jpg",
    href: "/shop?category=decor",
    badge: "Ready to Ship",
    actionLabel: "Browse Décor",
  },
];
