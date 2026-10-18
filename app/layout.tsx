import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Promethix3D",
    template: "%s | Promethix3D",
  },
  description:
    "Promethix3d is a 3D printing service in Kolkata, India. We make gifts, figurines, working parts and prototypes.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        {children}
        <WhatsAppButton />
        <GoogleAnalytics gaId="G-SV1M66T9HY" />
      </body>
    </html>
  );
}
