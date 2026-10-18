export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: "general" | "materials" | "shipping" | "consultancy";
}

export const faqs: FAQItem[] = [
  {
    id: "cost",
    question: "How much does a custom print or product consultation cost?",
    answer:
      "Pricing is based purely on material volume, print machine hours, and any required CAD modelling or finishing. Standard products in our shop have fixed upfront prices. For custom orders, we provide an all-inclusive, fixed quote within 24 hours of reviewing your files or sketch—no hidden surcharges.",
    category: "general",
  },
  {
    id: "materials",
    question: "Which materials do you print with, and how do I choose?",
    answer:
      "We stock an extensive range of industrial and aesthetic filaments and resins: Standard PLA+ (smooth, eco-friendly, great for gifts & display), PETG (heat-resistant, food-safe, strong for functional brackets), ABS/ASA (UV-proof and impact-resistant for automotive or outdoor use), TPU (flexible, rubber-like for seals, tires and gaskets), Carbon-Fibre composites (ultra-stiff and lightweight for robotics and drone frames), and High-Resolution SLA Photopolymer Resin (8K/12K detail for figurines, miniatures and jewelry masters). Our team advises the best material for your specific mechanical and environmental requirements.",
    category: "materials",
  },
  {
    id: "turnaround",
    question: "What is your production and delivery turnaround time?",
    answer:
      "Catalog products that are in stock dispatch within 24–48 hours. Custom 3D prints with existing 3D files (STL/STEP) take 2–4 business days for printing, post-processing, and dimensional inspection. Complex custom CAD modelling and prototyping jobs typically take 3–6 business days depending on design complexity. Tracked express shipping takes 2–4 days across major Indian metros.",
    category: "shipping",
  },
  {
    id: "shipping",
    question: "Do you ship across India, and how do you protect fragile prints?",
    answer:
      "Yes, we ship to all pin codes across India using tracked express courier partners (Delhivery, BlueDart, DTDC). Every item is packed in heavy-gauge bubble wrap, custom foam cradles, and rigid corrugated shipping boxes designed to survive transit shocks. In the rare event of transit damage, share an unboxing photo within 24 hours and we reprint and reship at zero additional cost.",
    category: "shipping",
  },
  {
    id: "broken-parts",
    question: "Can you reproduce a broken plastic part without an original 3D file?",
    answer:
      "Yes! You don't need CAD software or prior 3D experience. Send us clear photos of the broken part with a ruler or calipers for scale, or courier the physical pieces to our Kolkata workshop. Our engineers will reverse-engineer the geometry, strengthen known stress failure points, generate a clean CAD model, and print a functional drop-in replacement.",
    category: "consultancy",
  },
  {
    id: "files-accepted",
    question: "What file formats do you accept for quotes and 3D printing?",
    answer:
      "We accept STL, STEP (.step / .stp), OBJ, 3MF, IGES, SLDPRT, and DXF files. If you don't have a 3D CAD model yet, you can upload dimensioned 2D drawings (PDF), hand sketches, or reference photos (JPG, PNG).",
    category: "consultancy",
  },
  {
    id: "consultancy-scope",
    question: "What does your product consultancy include?",
    answer:
      "Our consultancy bridges the gap between idea and physical manufacturing. We review Design for Additive Manufacturing (DFAM), identify overhang and thin-wall risks, recommend optimal print orientation to maximize layer adhesion, choose appropriate infill patterns, and determine whether 3D printing or traditional tooling is more cost-effective for your production run.",
    category: "consultancy",
  },
  {
    id: "bulk-orders",
    question: "Do you handle batch production and corporate event mementoes?",
    answer:
      "Yes, our print farm accommodates short-run production batches from 10 to 500+ units. We regularly manufacture custom trophies, personalized company mementoes, event giveaways, and branded desk accessories with custom color schemes and logo embossing.",
    category: "general",
  },
];
