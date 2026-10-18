export interface HeroSlide {
  id: string;
  category: "products" | "consultancy" | "parts" | "gifts";
  eyebrow: string;
  headline: string;
  subline: string;
  image: string;
  imageAlt: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  accentBadge: string;
}

export interface FloatingProductHighlight {
  id: string;
  name: string;
  price: number;
  material: string;
  image: string;
  href: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: "products",
    category: "products",
    eyebrow: "Promethix3D · Made in Kolkata",
    headline: "Imagination, printed into reality.",
    subline:
      "Every piece is 100% 3D printed with engineering-grade precision, then hand-finished and painted for a premium look you can feel. Shop our ready-to-ship collection or partner with our team to build something that's entirely yours.",
    image: "/hero-slide-1.jpg",
    imageAlt: "Detailed 3D printed mechanical and artistic products produced by Promethix3D",
    primaryCta: {
      label: "Shop Now",
      href: "/shop",
    },
    secondaryCta: {
      label: "Book a Free Consultation",
      href: "/custom-orders",
    },
    accentBadge: "100% 3D Printed",
  },
  {
    id: "consultancy",
    category: "consultancy",
    eyebrow: "Product Design & Engineering · Kolkata",
    headline: "From rough sketch to production-ready CAD.",
    subline:
      "Work one-on-one with our engineers to validate your idea, model it in CAD and fine-tune tolerances, wall thickness and materials, so your design performs in the real world, not just on screen.",
    image: "/category-prototypes.jpg",
    imageAlt: "CAD design model and functional prototype engineered at Promethix3D",
    primaryCta: {
      label: "Shop Now",
      href: "/shop",
    },
    secondaryCta: {
      label: "Book a Free Consultation",
      href: "/custom-orders",
    },
    accentBadge: "Design & CAD Support",
  },
  {
    id: "parts",
    category: "parts",
    eyebrow: "Reverse Engineering · Functional Spares",
    headline: "Part broken or discontinued? We'll bring it back.",
    subline:
      "Share measurements, photos or the broken piece itself. We rebuild the geometry from scratch and print it in tough PETG, ABS or carbon-fibre, so your machine, appliance or gear is back in action fast.",
    image: "/hero-slide-3.jpg",
    imageAlt: "Precision mechanical gears, brackets and replacement parts",
    primaryCta: {
      label: "Shop Now",
      href: "/shop",
    },
    secondaryCta: {
      label: "Get a Part Quote",
      href: "/custom-orders",
    },
    accentBadge: "Industrial-Grade Materials",
  },
  {
    id: "gifts",
    category: "gifts",
    eyebrow: "Personalised Gifts · Lithophanes · Décor",
    headline: "Gifts that glow with meaning.",
    subline:
      "Turn your favourite photo into a luminous lithophane lamp, or choose from richly detailed figurines and modern desk accents. Each one is 3D printed, hand-painted and made to be remembered.",
    image: "/hero-slide-2.jpg",
    imageAlt: "Ambient 3D printed lithophane lamp and decorative desk piece",
    primaryCta: {
      label: "Shop Now",
      href: "/shop",
    },
    secondaryCta: {
      label: "Create a Custom Gift",
      href: "/custom-orders",
    },
    accentBadge: "Hand-Painted 3D Prints",
  },
];

export const heroFloatingProducts: FloatingProductHighlight[] = [
  {
    id: "lithophane-lamp",
    name: "Custom Photo Lithophane Lamp",
    price: 1499,
    material: "High-Opacity PLA+",
    image: "/category-lamps.jpg",
    href: "/shop",
  },
  {
    id: "precision-gearset",
    name: "Reinforced Precision Gear Set",
    price: 650,
    material: "PETG / Carbon-Fibre",
    image: "/category-mechanical.jpg",
    href: "/shop",
  },
  {
    id: "anime-figurine",
    name: "Collector's Character Figurine",
    price: 899,
    material: "High-Res SLA Resin",
    image: "/category-figurines.jpg",
    href: "/shop",
  },
];

export const heroSocialProof = {
  metric: "200+ products delivered",
  highlight: "Trusted by customers across Kolkata & India",
  subtext: "Free review · No obligation · Reply within 24 hours",
};