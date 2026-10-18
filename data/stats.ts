export interface StatItem {
  id: string;
  value: string;
  label: string;
  description: string;
}

export const stats: StatItem[] = [
  {
    id: "products-sold",
    value: "200+",
    label: "Products Delivered",
    description: "Shipped securely to creators, businesses, and homes across India and abroad.",
  },
  {
    id: "quote-time",
    value: "< 24h",
    label: "Quote Turnaround",
    description: "Engineering review and fixed quote with zero hidden charges.",
  },
  {
    id: "consultancy-projects",
    value: "50+",
    label: "CAD & Custom Parts",
    description: "CAD models engineered, reverse-engineered and produced in-house.",
  },
  {
    id: "satisfaction",
    value: "99.4%",
    label: "Spec Compliance",
    description: "Precision dimensional checks using digital vernier calipers.",
  },
];
