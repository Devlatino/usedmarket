import { Marketplace } from "@shared/schema";
import { BaseApiClient } from "./BaseApiClient";
import { EbayApiClient } from "./EbayApiClient";
import { AmazonApiClient } from "./AmazonApiClient";
import { SubitoApiClient } from "./SubitoApiClient";

// Factory class to create API clients for different marketplaces
export class ApiClientFactory {
  // Store instances of API clients to avoid creating duplicates
  private static clients: Record<string, BaseApiClient | null> = {
    ebay: null,
    amazon: null,
    facebook: null,
    craigslist: null,
    etsy: null,
    subito: null,
    kijiji: null,
    bakeca: null,
    idealista: null,
    immobiliare: null,
    autoscout24: null,
    vinted: null,
    rebelle: null,
    // Aggiungiamo i nuovi marketplace europei
    leboncoin: null,
    wallapop: null,
    allegro: null
  };
  
  /**
   * Get an API client for the specified marketplace
   * @param marketplace Marketplace to get client for
   * @returns API client instance or null if not supported
   */
  static getClient(marketplace: string): BaseApiClient | null {
    // If we already have an instance, return it
    if (this.clients[marketplace]) {
      return this.clients[marketplace];
    }
    
    // Create a new instance based on the marketplace
    switch (marketplace) {
      case 'ebay':
        this.clients[marketplace] = new EbayApiClient();
        break;
      case 'amazon':
        this.clients[marketplace] = new AmazonApiClient();
        break;
      case 'subito':
        this.clients[marketplace] = new SubitoApiClient();
        break;
      // Add other marketplace clients as they are implemented
      default:
        // Return null for unsupported marketplaces
        return null;
    }
    
    return this.clients[marketplace];
  }
  
  /**
   * Get all available API clients
   * @returns Array of all implemented API clients
   */
  static getAllClients(): BaseApiClient[] {
    const clients: BaseApiClient[] = [];
    
    // Get all implemented clients
    for (const marketplace of Object.keys(this.clients) as Marketplace[]) {
      const client = this.getClient(marketplace);
      if (client) {
        clients.push(client);
      }
    }
    
    return clients;
  }
}