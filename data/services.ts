export interface ServiceItem {
  id: string;
  title: string;
  category: "consultancy" | "manufacturing" | "specialty";
  tagline: string;
  description: string;
  features: string[];
  materialsOrTools: string[];
  ctaText: string;
  ctaHref: string;
  iconName: "DraftingCompass" | "Sparkles" | "Layers" | "Wrench" | "Cpu" | "Boxes";
  badge: string;
}

export const services: ServiceItem[] = [
  {
    id: "cad-modelling",
    title: "CAD 3D Modelling",
    category: "consultancy",
    tagline: "Turn concepts & drawings into parametic 3D models",
    description:
      "Have an idea, sketch, or 2D drawing? Our CAD engineers create clean, parametric 3D models ready for 3D printing, injection moulding or CNC machining.",
    features: [
      "2D to 3D solid modelling",
      "Parametric source files (STEP, IGES, STL)",
      "Assembly fit & interference checking",
      "Dimensional tolerance optimization",
    ],
    materialsOrTools: ["SolidWorks", "Fusion 360", "Blender", "STEP / STP"],
    ctaText: "Request CAD Help",
    ctaHref: "/custom-orders?service=cad",
    iconName: "DraftingCompass",
    badge: "Engineering Support",
  },
  {
    id: "prototyping-consultancy",
    title: "Prototyping & DFM Consultancy",
    category: "consultancy",
    tagline: "De-risk manufacturing before tooling expenditure",
    description:
      "Design for Additive Manufacturing (DFAM) guidance. We review your parts for wall thickness, snap-fit resilience, overhang angles and thermal deflection.",
    features: [
      "Manufacturability audit",
      "Cost-down material suggestions",
      "Functional snap-fit & thread testing",
      "Rapid iterative revision cycles",
    ],
    materialsOrTools: ["DFM Audit", "FDM / SLA", "Tensile Analysis", "Fast Iterations"],
    ctaText: "Book Design Review",
    ctaHref: "/custom-orders?service=prototype",
    iconName: "Cpu",
    badge: "Strategic Advice",
  },
  {
    id: "replacement-parts",
    title: "Replacement Parts & Spares",
    category: "consultancy",
    tagline: "Reverse engineer obsolete or broken plastic components",
    description:
      "Don't discard an entire machine, appliance or vehicle interior over a snapped plastic gear or bracket. We measure, reinforce and recreate the exact geometry.",
    features: [
      "Reverse engineering from broken physical pieces",
      "Strengthened stress-concentration fillets",
      "High-temperature & chemical-resistant plastics",
      "Zero minimum order quantity (MOQ: 1)",
    ],
    materialsOrTools: ["PETG-CF", "ABS", "Nylon Blends", "Caliper Metrology"],
    ctaText: "Replicate a Part",
    ctaHref: "/custom-orders?service=parts",
    iconName: "Wrench",
    badge: "Reverse Engineering",
  },
  {
    id: "sla-resin",
    title: "SLA High-Precision Resin Printing",
    category: "manufacturing",
    tagline: "Micron-level sharpness with virtually invisible layer lines",
    description:
      "State-of-the-art stereolithography printing for figurines, miniatures, dental masters, jewelry patterns, and products demanding ultra-smooth surface finishes.",
    features: [
      "Layer height down to 25–50 microns",
      "Ultra-fine organic curves and facial details",
      "Post-curing and alcohol ultrasonic wash",
      "Primer and display-ready finish",
    ],
    materialsOrTools: ["8K/12K SLA", "Standard Photopolymer", "Tough Resin", "Castable"],
    ctaText: "Explore Resin Printing",
    ctaHref: "/custom-orders?service=sla",
    iconName: "Sparkles",
    badge: "Ultra Resolution",
  },
  {
    id: "fdm-filament",
    title: "FDM Structural Filament Printing",
    category: "manufacturing",
    tagline: "Durable, high-strength parts built for real-world stress",
    description:
      "Fused Deposition Modeling utilizing engineering-grade polymers. Ideal for custom brackets, machine enclosures, outdoor housings and large-format objects.",
    features: [
      "Large build volume capability",
      "Optimized gyroid and cubic infill structures",
      "Heat deflection up to 100°C+ (PETG / ABS)",
      "Carbon-fibre reinforced rigidity",
    ],
    materialsOrTools: ["PLA+", "PETG", "ABS", "PETG-CF", "TPU 95A"],
    ctaText: "Order FDM Prints",
    ctaHref: "/custom-orders?service=fdm",
    iconName: "Layers",
    badge: "High Strength",
  },
  {
    id: "bulk-mementoes",
    title: "Bulk & Event Mementoes",
    category: "specialty",
    tagline: "Custom batch production for corporate events and gifts",
    description:
      "Custom corporate awards, event mementoes, branded keychains, architectural models and batch manufacturing from 10 to 500+ units with quick turnarounds.",
    features: [
      "Custom embossed company branding & logos",
      "Individual name personalization per piece",
      "Volume tier discounts",
      "Kitted and protected gift box packaging",
    ],
    materialsOrTools: ["Batch Print Farm", "Pantone Colour Matching", "Gift Boxes"],
    ctaText: "Inquire for Bulk",
    ctaHref: "/custom-orders?service=bulk",
    iconName: "Boxes",
    badge: "Volume Production",
  },
];
