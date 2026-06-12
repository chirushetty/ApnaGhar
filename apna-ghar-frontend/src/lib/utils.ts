import type { ListingType } from "@/types/property";

type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number, listingType: ListingType): string {
  if (listingType === "rent") {
    return `₹${price.toLocaleString("en-IN")}/mo`;
  }
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    const lakhs = price / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)} L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString("en-IN")} sq.ft.`;
}

export function postedLabel(daysAgo: number): string {
  if (daysAgo === 0) return "Posted today";
  if (daysAgo === 1) return "Posted yesterday";
  if (daysAgo < 7) return `Posted ${daysAgo} days ago`;
  if (daysAgo < 30) return `Posted ${Math.floor(daysAgo / 7)} week(s) ago`;
  return `Posted ${Math.floor(daysAgo / 30)} month(s) ago`;
}
