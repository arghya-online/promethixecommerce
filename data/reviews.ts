export interface Review {
  id: string;
  name: string;
  city: string;
  project: string;
  type: "product" | "consultancy" | "part";
  rating: number;
  comment: string;
  date?: string;
}

export const reviews: Review[] = [
  {
    id: "review-1",
    name: "Sourav Chatterjee",
    city: "Kolkata, WB",
    project: "Custom 3D Printed Part",
    type: "part",
    rating: 5,
    comment:
      "Got a custom mechanical part printed for a robotics project. The fit was exact and the finish was remarkably clean. Communication on WhatsApp was smooth and prompt throughout.",
    date: "Recent Customer",
  },
  {
    id: "review-2",
    name: "Ananya Mukherjee",
    city: "Kolkata, WB",
    project: "Personalised Lithophane Lamp",
    type: "product",
    rating: 5,
    comment:
      "Ordered a personalised photo lamp for an anniversary gift. When lit, the photo came to life with so much detail. The packaging was shockproof and delivered right on time.",
    date: "Verified Buyer",
  },
  {
    id: "review-3",
    name: "Ritwik Banerjee",
    city: "Kolkata, WB",
    project: "High-Res SLA Figurine",
    type: "product",
    rating: 5,
    comment:
      "The figurine came out really well. The facial details and smooth curves were crisp with zero visible layer lines. Will definitely order again for custom models.",
    date: "Verified Buyer",
  },
  {
    id: "review-4",
    name: "Debashis Roy",
    city: "Bengaluru, KA",
    project: "CAD Design & Enclosure Prototype",
    type: "consultancy",
    rating: 5,
    comment:
      "Promethix3D reviewed our rough CAD assembly, corrected the snap-fit tolerances, and had working prototypes in our hands within 4 days. Saved us weeks of tooling rework.",
    date: "Hardware Startup Founder",
  },
  {
    id: "review-5",
    name: "Priyanka Sen",
    city: "Howrah, WB",
    project: "Washing Machine Knob Replacement",
    type: "part",
    rating: 5,
    comment:
      "An old appliance knob snapped and wasn't available anywhere in the market. I sent Promethix3D photos with a scale; they recreated the D-shaft socket in PETG and it clicked right in.",
    date: "Verified Customer",
  },
];
