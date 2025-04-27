import { z } from "zod";

// Import remaining types from the shared schema
import { 
  marketplaceEnum, filterSchema 
} from "@shared/schema";

// Define types directly to avoid issues with re-exporting
export type Filter = {
  price?: {
    min?: number;
    max?: number;
  };
  condition?: string;
  location?: {
    distance?: number;
    zipCode?: string;
  };
  sortBy?: string;
};

// Define Marketplace type directly
export type Marketplace = 
  // Siti internazionali
  | "ebay" | "amazon" | "facebook" | "craigslist" | "etsy" 
  // Siti italiani
  | "subito" | "kijiji" | "bakeca" | "idealista" | "immobiliare" | "autoscout24" | "vinted" | "rebelle"
  // Altri siti europei
  | "leboncoin" | "wallapop" | "allegro";

// Define Search type directly
export type Search = {
  id: number;
  userId: number;
  query: string;
  filters: Filter | null;
  active: boolean;
  createdAt: string;
};

// Define Result type directly
export type Result = {
  id: number;
  searchId: number;
  title: string;
  price: string;
  condition?: string;
  location?: string;
  imageUrl?: string;
  listingUrl: string;
  marketplace: string;
  postedAt?: string;
  createdAt: string;
  seen: boolean;
};

// Define Notification type directly
export type Notification = {
  id: number;
  userId: number;
  searchId: number;
  resultId: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export {
  marketplaceEnum, filterSchema
};

// Search form schema
export const searchFormSchema = z.object({
  query: z.string().min(2, "Search term must be at least 2 characters"),
  filters: filterSchema.optional(),
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;

// Price range options for filter
export const priceRangeOptions = [
  { value: "any", label: "Prezzo: Qualsiasi" },
  { value: "under50", label: "Sotto 50€" },
  { value: "50to100", label: "50 - 100€" },
  { value: "100to200", label: "100 - 200€" },
  { value: "over200", label: "Oltre 200€" },
];

// Condition options for filter
export const conditionOptions = [
  { value: "any", label: "Condizione: Qualsiasi" },
  { value: "new", label: "Nuovo" },
  { value: "likeNew", label: "Come nuovo" },
  { value: "good", label: "Buono" },
  { value: "fair", label: "Discreto" },
  { value: "poor", label: "Usurato" },
];

// Location options for filter
export const locationOptions = [
  { value: "any", label: "Località: Qualsiasi" },
  { value: "10miles", label: "Entro 15 km" },
  { value: "25miles", label: "Entro 40 km" },
  { value: "50miles", label: "Entro 80 km" },
  { value: "100miles", label: "Entro 160 km" },
];

// Sort options for filter
export const sortOptions = [
  { value: "bestMatch", label: "Ordina: Pertinenza" },
  { value: "priceLow", label: "Prezzo: Crescente" },
  { value: "priceHigh", label: "Prezzo: Decrescente" },
  { value: "newest", label: "Più recenti" },
  { value: "endingSoon", label: "In scadenza" },
];

// Helper function to map price range option to filter values
export function getPriceRangeFilter(option: string): { min?: number; max?: number } {
  switch (option) {
    case "under50":
      return { max: 50 };
    case "50to100":
      return { min: 50, max: 100 };
    case "100to200":
      return { min: 100, max: 200 };
    case "over200":
      return { min: 200 };
    default:
      return {};
  }
}

// Helper function to map location option to filter values
export function getLocationFilter(option: string): { distance?: number } {
  switch (option) {
    case "10miles":
      return { distance: 10 };
    case "25miles":
      return { distance: 25 };
    case "50miles":
      return { distance: 50 };
    case "100miles":
      return { distance: 100 };
    default:
      return {};
  }
}

// Helper function to map sort option to sort value
export function getSortValue(option: string): string {
  switch (option) {
    case "priceLow":
      return "Prezzo: Crescente";
    case "priceHigh":
      return "Prezzo: Decrescente";
    case "newest":
      return "Più recenti";
    case "endingSoon":
      return "In scadenza";
    default:
      return "Pertinenza";
  }
}

// Market place info for display
export const marketplaceInfo = {
  // Siti internazionali
  ebay: {
    name: "eBay",
    icon: "fa-ebay",
    color: "#e53238"
  },
  amazon: {
    name: "Amazon",
    icon: "fa-amazon",
    color: "#ff9900"
  },
  facebook: {
    name: "Facebook",
    icon: "fa-facebook",
    color: "#3b5998"
  },
  craigslist: {
    name: "Craigslist",
    icon: "fa-store",
    color: "#5c2d91"
  },
  etsy: {
    name: "Etsy",
    icon: "fa-shopping-bag",
    color: "#f47820"
  },
  
  // Siti italiani
  subito: {
    name: "Subito.it",
    icon: "fa-tag",
    color: "#f9423a"
  },
  kijiji: {
    name: "Kijiji",
    icon: "fa-bullhorn",
    color: "#f8991d"
  },
  bakeca: {
    name: "Bakeca",
    icon: "fa-clipboard",
    color: "#005ca0"
  },
  idealista: {
    name: "Idealista",
    icon: "fa-home",
    color: "#4aba5c"
  },
  immobiliare: {
    name: "Immobiliare.it",
    icon: "fa-building",
    color: "#0066cc"
  },
  autoscout24: {
    name: "AutoScout24",
    icon: "fa-car",
    color: "#f7a900"
  },
  vinted: {
    name: "Vinted",
    icon: "fa-tshirt",
    color: "#09b1ba"
  },
  rebelle: {
    name: "Rebelle",
    icon: "fa-gem",
    color: "#e10f21"
  },
  
  // Altri siti europei
  leboncoin: {
    name: "Leboncoin",
    icon: "fa-store",
    color: "#F56B2A"
  },
  wallapop: {
    name: "Wallapop",
    icon: "fa-shopping-bag",
    color: "#12CCCA"
  },
  allegro: {
    name: "Allegro",
    icon: "fa-shopping-cart",
    color: "#FF5A00"
  }
};

// Parse a date string or Date object into a relative time string in Italian
export function getRelativeTime(date: Date | string | undefined): string {
  if (!date) return "Sconosciuto";
  
  const now = new Date();
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const diff = now.getTime() - dateObj.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return days === 1 ? "ieri" : `${days} giorni fa`;
  } else if (hours > 0) {
    return hours === 1 ? "1 ora fa" : `${hours} ore fa`;
  } else if (minutes > 0) {
    return minutes === 1 ? "1 minuto fa" : `${minutes} minuti fa`;
  } else {
    return "adesso";
  }
}
