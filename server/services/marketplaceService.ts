import { Result, InsertResult, Filter, Marketplace } from "@shared/schema";
import { ScrapingClientFactory } from "./scraping/ScrapingClientFactory";

// Backup mock data for marketplaces that don't have scraping clients yet
const mockListings: Record<Marketplace, Array<Omit<InsertResult, "searchId" | "seen">>> = {
  ebay: [
    {
      title: "Lampada da Scrivania Vintage in Ottone - Stile Art Deco - Funzionante",
      price: "75€",
      condition: "Usato - Buono",
      location: "Milano, IT",
      imageUrl: "https://images.unsplash.com/photo-1609799545166-347a5ba518cf",
      listingUrl: "https://example.com/ebay-listing-1",
      marketplace: "ebay",
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ],
  amazon: [
    {
      title: "Lampada da Scrivania Regolabile con Porta USB - Design Vintage",
      price: "89.99€",
      condition: "Usato - Come Nuovo",
      location: "Deposito Amazon",
      imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8",
      listingUrl: "https://example.com/amazon-listing-1",
      marketplace: "amazon",
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ],
  subito: [
    {
      title: "Lampada Vintage Anni '70 - Ottimo Stato - Perfettamente Funzionante",
      price: "65€",
      condition: "Usato - Buono",
      location: "Torino, IT",
      imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15",
      listingUrl: "https://example.com/subito-listing-1",
      marketplace: "subito",
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ],
  facebook: [
    {
      title: "Lampada da Scrivania Mid-Century Modern - Base in Teak - Completamente Restaurata",
      price: "120€",
      condition: "Usato - Come Nuovo",
      location: "Roma, IT",
      imageUrl: "https://images.unsplash.com/photo-1566033740559-0b6e27aebc68",
      listingUrl: "https://example.com/facebook-listing-1",
      marketplace: "facebook",
      postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ],
  craigslist: [
    {
      title: "Lampada da Banchiere Antica con Paralume in Vetro Verde - Base in Ottone",
      price: "95€",
      condition: "Usato - Buono",
      location: "Napoli, IT",
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
      listingUrl: "https://example.com/craigslist-listing-1",
      marketplace: "craigslist",
      postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ],
  etsy: [
    {
      title: "Lampada da Scrivania Steampunk Artigianale - Lampadina Edison - Design in Rame",
      price: "135€",
      condition: "Nuovo - Fatto a Mano",
      location: "Firenze, IT",
      imageUrl: "https://images.unsplash.com/photo-1572703513856-b9932fe6dda1",
      listingUrl: "https://example.com/etsy-listing-1",
      marketplace: "etsy",
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ],
  kijiji: [
    {
      title: "Lampada da Terra Design Italiano - Modello Arco - Ispirazione Castiglioni",
      price: "180€",
      condition: "Usato - Buono",
      location: "Bologna, IT",
      imageUrl: "https://images.unsplash.com/photo-1507394650917-79c6351bc291",
      listingUrl: "https://example.com/kijiji-listing-1",
      marketplace: "kijiji",
      postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ],
  bakeca: [
    {
      title: "Lampada da Parete Vintage - Ottone e Vetro - Stile Industrial",
      price: "45€",
      condition: "Usato - Discreto",
      location: "Palermo, IT",
      imageUrl: "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9",
      listingUrl: "https://example.com/bakeca-listing-1",
      marketplace: "bakeca",
      postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ],
  idealista: [
    {
      title: "Lampade da Soffitto a LED - Set di 3 - Design Minimalista",
      price: "99€",
      condition: "Nuovo",
      location: "Genova, IT",
      imageUrl: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89",
      listingUrl: "https://example.com/idealista-listing-1",
      marketplace: "idealista",
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ],
  immobiliare: [
    {
      title: "Lampadario Cristallo Vintage - Perfette Condizioni - Stile Swarovski",
      price: "250€",
      condition: "Usato - Come Nuovo",
      location: "Venezia, IT",
      imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
      listingUrl: "https://example.com/immobiliare-listing-1",
      marketplace: "immobiliare",
      postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ],
  autoscout24: [
    {
      title: "Fari LED Vintage per Auto d'Epoca - Perfettamente Restaurati",
      price: "120€",
      condition: "Restaurato",
      location: "Verona, IT",
      imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c",
      listingUrl: "https://example.com/autoscout-listing-1",
      marketplace: "autoscout24",
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ],
  vinted: [
    {
      title: "Lampada da Tavolo Vintage Anni '50 - Paralume Originale",
      price: "75€",
      condition: "Usato - Buono",
      location: "Bari, IT",
      imageUrl: "https://images.unsplash.com/photo-1540932239986-30128078f3c5",
      listingUrl: "https://example.com/vinted-listing-1",
      marketplace: "vinted",
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ],
  rebelle: [
    {
      title: "Lampada Designer Italiano - Pezzo da Collezione - Limited Edition",
      price: "350€",
      condition: "Usato - Come Nuovo",
      location: "Milano, IT",
      imageUrl: "https://images.unsplash.com/photo-1541388400985-83a99018326c",
      listingUrl: "https://example.com/rebelle-listing-1",
      marketplace: "rebelle",
      postedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    }
  ],
  // Altri siti europei
  leboncoin: [
    {
      title: "Lampe Vintage des Années 60 - Parfait État - Designer Français",
      price: "95€",
      condition: "Usato - Buono",
      location: "Paris, FR",
      imageUrl: "https://images.unsplash.com/photo-1563099040-d4eac072310f",
      listingUrl: "https://example.com/leboncoin-listing-1",
      marketplace: "leboncoin",
      postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  ],
  wallapop: [
    {
      title: "Lámpara Vintage de Diseño Español - Años 70",
      price: "85€",
      condition: "Usado - Buen estado",
      location: "Barcelona, ES",
      imageUrl: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89",
      listingUrl: "https://example.com/wallapop-listing-1",
      marketplace: "wallapop",
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ],
  allegro: [
    {
      title: "Lampa Vintage z lat 70-tych - Stan Idealny",
      price: "250 PLN",
      condition: "Używane",
      location: "Warszawa, PL",
      imageUrl: "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9",
      listingUrl: "https://example.com/allegro-listing-1",
      marketplace: "allegro",
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ]
};

export class MarketplaceService {
  /**
   * Search all marketplaces for items matching the query and filters
   * @param query Search query term
   * @param filters Optional filters to apply to the search
   * @returns Promise with array of results from all marketplaces
   */
  async searchAllMarketplaces(query: string, filters?: Filter): Promise<Omit<InsertResult, "searchId" | "seen">[]> {
    const results: Omit<InsertResult, "searchId" | "seen">[] = [];
    const normalizedQuery = query.toLowerCase();
    
    // Get all available scraping clients
    const scrapingClients = ScrapingClientFactory.getAllClients();
    const scrapedMarketplaces = scrapingClients.map(client => client.marketplace);
    
    console.log(`Starting search for "${query}" across ${scrapingClients.length} marketplace clients`);
    
    // Search using scraping clients
    const scrapingPromises = scrapingClients.map(client => 
      client.search(query, filters)
        .catch(error => {
          console.error(`Error scraping ${client.marketplace}:`, error);
          return [];
        })
    );
    
    // Execute all scraping operations in parallel
    const scrapedResults = await Promise.all(scrapingPromises);
    
    // Combine all scraped results
    for (let i = 0; i < scrapedResults.length; i++) {
      console.log(`Found ${scrapedResults[i].length} results from ${scrapingClients[i].marketplace}`);
      results.push(...scrapedResults[i]);
    }
    
    // For marketplaces without scraping clients, use mock data
    for (const marketplace of Object.keys(mockListings) as Marketplace[]) {
      // Skip marketplaces that have scraping clients
      if (scrapedMarketplaces.includes(marketplace)) {
        continue;
      }
      
      console.log(`Using mock data for ${marketplace} (no scraping client available)`);
      
      const marketplaceResults = mockListings[marketplace]
        .filter(item => this.matchesQueryAndFilters(item, normalizedQuery, filters));
      
      results.push(...marketplaceResults);
    }
    
    console.log(`Total results found: ${results.length}`);
    
    // Sort results based on filters
    return this.sortResults(results, filters?.sortBy);
  }
  
  /**
   * Check if an item matches the query and filters
   * @param item Item to check
   * @param query Normalized query string
   * @param filters Optional filters to apply
   * @returns Boolean indicating if the item matches
   */
  private matchesQueryAndFilters(
    item: Omit<InsertResult, "searchId" | "seen">, 
    query: string, 
    filters?: Filter
  ): boolean {
    // Check if item matches query
    if (!item.title.toLowerCase().includes(query)) {
      return false;
    }
    
    // Apply price filter
    if (filters?.price) {
      const itemPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      
      if (filters.price.min !== undefined && itemPrice < filters.price.min) {
        return false;
      }
      
      if (filters.price.max !== undefined && itemPrice > filters.price.max) {
        return false;
      }
    }
    
    // Apply condition filter
    if (filters?.condition && item.condition && !item.condition.toLowerCase().includes(filters.condition.toLowerCase())) {
      return false;
    }
    
    // Apply location filter (simplified)
    if (filters?.location?.zipCode && item.location && !item.location.includes(filters.location.zipCode)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Sort results based on the sortBy filter
   * @param results Results to sort
   * @param sortBy Sort option
   * @returns Sorted results
   */
  private sortResults(
    results: Omit<InsertResult, "searchId" | "seen">[], 
    sortBy?: string
  ): Omit<InsertResult, "searchId" | "seen">[] {
    if (!sortBy || sortBy === "Best Match" || sortBy === "Pertinenza") {
      return results;
    }
    
    switch (sortBy) {
      case "Price: Low to High":
      case "Prezzo: Crescente":
        return results.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });
        
      case "Price: High to Low":
      case "Prezzo: Decrescente":
        return results.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return priceB - priceA;
        });
        
      case "Newest First":
      case "Più recenti":
        return results.sort((a, b) => {
          return (b.postedAt?.getTime() || 0) - (a.postedAt?.getTime() || 0);
        });
        
      case "Ending Soon":
      case "In scadenza":
        // This would require knowledge of listing end times
        // For now, we'll just return the results as is
        return results;
        
      default:
        return results;
    }
  }
}

export const marketplaceService = new MarketplaceService();
