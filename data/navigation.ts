export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
  highlight?: boolean;
  badge?: string;
}

export interface MobileTabItem {
  id: "home" | "shop" | "consult" | "cart" | "account";
  label: string;
  href: string;
  iconName: "Home" | "ShoppingBag" | "Compass" | "ShoppingCart" | "User";
}

export interface FooterSection {
  title: string;
  links: NavItem[];
}

export const headerNavLinks: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "What We Print", href: "/#categories" },
  { label: "Services", href: "/#services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
  { label: "FAQs", href: "/#faqs" },
];

export const headerCta: NavItem = {
  label: "Book a Consultation",
  href: "/custom-orders",
  highlight: true,
};

export const mobileTabLinks: MobileTabItem[] = [
  { id: "home", label: "Home", href: "/", iconName: "Home" },
  { id: "shop", label: "Shop", href: "/shop", iconName: "ShoppingBag" },
  {
    id: "consult",
    label: "Consult",
    href: "/custom-orders",
    iconName: "Compass",
  },
  { id: "cart", label: "Cart", href: "/cart", iconName: "ShoppingCart" },
  { id: "account", label: "Account", href: "/account", iconName: "User" },
];

export const footerSections: FooterSection[] = [
  {
    title: "Products & Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Personalised Lamps", href: "/shop?category=lamps" },
      { label: "Figurines & Idols", href: "/shop?category=figurines" },
      { label: "Home & Desk Décor", href: "/shop?category=decor" },
      { label: "Ready to Ship", href: "/shop" },
    ],
  },
  {
    title: "Consultancy & Custom",
    links: [
      { label: "Book a Consultation", href: "/custom-orders" },
      { label: "CAD 3D Modelling", href: "/custom-orders?service=cad" },
      { label: "Functional Spares & Parts", href: "/custom-orders?service=parts" },
      { label: "Rapid Prototyping", href: "/custom-orders?service=prototype" },
      { label: "SLA Resin & FDM Printing", href: "/custom-orders?service=print" },
      { label: "Bulk & Event Mementoes", href: "/custom-orders?service=bulk" },
    ],
  },
  {
    title: "Studio & Support",
    links: [
      { label: "About Our Studio", href: "/about" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Frequently Asked Questions", href: "/#faqs" },
      { label: "Customer Account", href: "/account" },
      {
        label: "WhatsApp Support",
        href: "https://wa.me/919832769269?text=Hi%20Promethix3D%2C%20I%20have%20an%20enquiry",
        isExternal: true,
      },
    ],
  },
];
