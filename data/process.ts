export interface ProcessStep {
  step: string;
  number: number;
  title: string;
  tagline: string;
  description: string;
  details: string[];
  iconName: "FileUp" | "Calculator" | "Printer" | "PackageCheck";
}

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    number: 1,
    title: "Share your requirement",
    tagline: "File, sketch, or broken part",
    description:
      "Upload a 3D file (STL, STEP, OBJ, 3MF) or share a napkin sketch, reference photos, or calipers measurements. Anything you have is enough to get started.",
    details: [
      "Accepts CAD models, PDF sketches, or photos",
      "Confidential file handling",
      "No technical 3D jargon required",
    ],
    iconName: "FileUp",
  },
  {
    step: "02",
    number: 2,
    title: "Feasibility & fixed quote",
    tagline: "Free engineering review",
    description:
      "Our team checks wall thicknesses, tolerances, and structural stress. We recommend the best filament or resin and send an exact, all-inclusive price before you pay.",
    details: [
      "Turnaround within 24 hours",
      "Expert material selection",
      "Clear, fixed pricing with zero hidden fees",
    ],
    iconName: "Calculator",
  },
  {
    step: "03",
    number: 3,
    title: "Precision print & QA",
    tagline: "Built in our Kolkata studio",
    description:
      "Your part is sliced with customized infill and layer heights, printed on tuned FDM or SLA machines, post-cured, and caliper-measured for tolerance. Custom painting is applied for styled finishes.",
    details: [
      "Calipers quality inspection",
      "Industrial FDM & 8K/12K SLA resin",
      "Hand-finished surface detailing",
    ],
    iconName: "Printer",
  },
  {
    step: "04",
    number: 4,
    title: "Shockproof pack & delivery",
    tagline: "Tracked to your doorstep",
    description:
      "Packed inside multi-layer shockproof bubble cradles and rigid boxes, your order is dispatched via tracked express courier with real-time tracking updates across India.",
    details: [
      "All-India courier coverage",
      "Live tracking link via SMS / WhatsApp",
      "Transit safety guarantee",
    ],
    iconName: "PackageCheck",
  },
];
