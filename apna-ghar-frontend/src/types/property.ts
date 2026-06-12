export type ListingType = "rent" | "buy";

export type PropertyType =
  | "Apartment"
  | "House"
  | "Villa"
  | "Plot"
  | "Commercial";

export interface PropertyOwner {
  name: string;
  type: "Owner" | "Agent" | "Builder";
  phone: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  isFurnished: boolean;
  parkingAvailable: boolean;
  vastuCompliant: boolean;
  locality: string;
  city: string;
  state: string;
  images: string[];
  amenities: string[];
  isFeatured: boolean;
  postedDaysAgo: number;
  owner: PropertyOwner;
}
