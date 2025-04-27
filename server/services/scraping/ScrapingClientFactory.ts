import { Marketplace } from "@shared/schema";
import { BaseScrapingClient } from "./BaseScrapingClient";
import { EbayScrapingClient } from "./EbayScrapingClient";
import { SubitoScrapingClient } from "./SubitoScrapingClient";
import { LeboncoinScrapingClient } from "./LeboncoinScrapingClient";
import { WallapopScrapingClient } from "./WallapopScrapingClient";
import { AllegroScrapingClient } from "./AllegroScrapingClient";

// Estendi il tipo Marketplace per includere i nuovi marketplace
type ExtendedMarketplace = Marketplace | 'leboncoin' | 'wallapop' | 'allegro';

/**
 * Factory class to create scraping clients for different marketplaces
 */
export class ScrapingClientFactory {
  // Store instances of scraping clients to avoid creating duplicates
  private static clients: Record<string, BaseScrapingClient | null> = {
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
   * Get a scraping client for the specified marketplace
   * @param marketplace Marketplace to get client for
   * @returns Scraping client instance or null if not supported
   */
  static getClient(marketplace: string): BaseScrapingClient | null {
    // If we already have an instance, return it
    if (this.clients[marketplace]) {
      return this.clients[marketplace];
    }
    
    // Create a new instance based on the marketplace
    switch (marketplace) {
      case 'ebay':
        this.clients[marketplace] = new EbayScrapingClient();
        break;
      case 'subito':
        this.clients[marketplace] = new SubitoScrapingClient();
        break;
      case 'leboncoin':
        this.clients[marketplace] = new LeboncoinScrapingClient();
        break;
      case 'wallapop':
        this.clients[marketplace] = new WallapopScrapingClient();
        break;
      case 'allegro':
        this.clients[marketplace] = new AllegroScrapingClient();
        break;
      // Add other marketplace clients as they are implemented
      default:
        // Return null for unsupported marketplaces
        return null;
    }
    
    return this.clients[marketplace];
  }
  
  /**
   * Get all available scraping clients
   * @returns Array of all implemented scraping clients
   */
  static getAllClients(): BaseScrapingClient[] {
    const clients: BaseScrapingClient[] = [];
    
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