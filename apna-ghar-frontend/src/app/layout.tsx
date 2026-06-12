import type { Metadata } from "next";
import { Yatra_One, Baloo_2, Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Bunting from "@/components/layout/Bunting";

const yatraOne = Yatra_One({
  weight: "400",
  subsets: ["latin", "devanagari"],
  variable: "--font-display",
});

const baloo2 = Baloo_2({
  subsets: ["latin", "devanagari"],
  variable: "--font-ui",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ApnaGhar — Rent & Buy Property in India",
  description:
    "Find your perfect home. Browse verified properties to rent or buy across major Indian cities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${yatraOne.variable} ${baloo2.variable} ${workSans.variable} bg-texture antialiased`}
      >
        <Bunting />
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
