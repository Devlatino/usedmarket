import { Filter, Marketplace } from "@shared/schema";
import { InsertResult } from "@shared/schema";

// Base API client that all marketplace-specific clients will extend
export abstract class BaseApiClient {
  protected marketplace: Marketplace;
  
  constructor(marketplace: Marketplace) {
    this.marketplace = marketplace;
  }
  
  /**
   * Search the marketplace for items matching the query and filters
   * @param query Search query term
   * @param filters Optional filters to apply to the search
   * @returns Promise with array of results
   */
  abstract search(query: string, filters?: Filter): Promise<Omit<InsertResult, "searchId" | "seen">[]>;
  
  /**
   * Helper method to normalize price formats
   * @param price Price in various formats
   * @returns Normalized price string with currency
   */
  protected normalizePrice(price: string | number): string {
    if (typeof price === "number") {
      return `${price.toFixed(2)}€`;
    }
    
    // If already formatted nicely, return as is
    if (typeof price === "string" && price.includes("€")) {
      return price;
    }
    
    return `${price}€`;
  }
  
  /**
   * Helper method to handle API errors
   * @param error Error object
   */
  protected handleApiError(error: any): void {
    console.error(`Error in ${this.marketplace} API client:`, error);
  }
}