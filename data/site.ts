export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  eyebrow: string;
  subline: string;
  description: string;
  contact: {
    phone: string;
    phoneDisplay: string;
    email: string;
    whatsapp: string;
    whatsappUrl: string;
  };
  address: {
    city: string;
    state: string;
    country: string;
    full: string;
  };
  social: {
    instagram: string;
    instagramHandle: string;
  };
  announcement: string;
  trustStrip: string[];
}

export const siteConfig: SiteConfig = {
  name: "Promethix3D",
  shortName: "Promethix3D",
  eyebrow: "Where Imagination Gets Reality · Kolkata",
  tagline: "Where imagination gets reality.",
  subline:
    "Everything is 100% 3D printed with precision engineering. We selectively paint and finish pieces for an elevated look. Shop ready-made products or collaborate with our engineers on custom manufacturing.",
  description:
    "Promethix3D is a Kolkata-based 3D printed products brand and product consultancy. Where imagination gets reality. Shop 100% 3D printed gifts, figurines and home décor, or collaborate with our engineers on CAD design, prototyping and custom manufacturing with tracked pan-India delivery.",
  contact: {
    phone: "+919832769269",
    phoneDisplay: "+91 98327 69269",
    email: "promethix3d@gmail.com",
    whatsapp: "+919832769269",
    whatsappUrl:
      "https://wa.me/919832769269?text=Hi%20Promethix3D%2C%20I%20have%20an%20enquiry%20about%20a%203D%20print%20or%20product%20consultancy.",
  },
  address: {
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
    full: "Kolkata, West Bengal, India",
  },
  social: {
    instagram: "https://www.instagram.com/promethix3d/",
    instagramHandle: "@promethix3d",
  },
  announcement:
    "Free review · Reply within 24 hrs · Tracked shipping across India",
  trustStrip: [
    "Made in-house",
    "CAD help included",
    "Fixed quote",
    "Tracked shipping",
  ],
};
