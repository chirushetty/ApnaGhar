import type { Metadata } from "next";
// Self-hosted fonts (via @fontsource) — no Google Fonts network fetch at build time.
// Family names are mapped to the --font-* CSS variables in globals.css.
import "@fontsource/yatra-one/400.css";
import "@fontsource-variable/baloo-2/index.css";
import "@fontsource-variable/work-sans/index.css";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Bunting from "@/components/layout/Bunting";

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
      <body className="bg-texture antialiased">
        <Bunting />
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
