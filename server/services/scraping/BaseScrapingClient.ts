import axios from 'axios';
import * as cheerio from 'cheerio';
import { Filter, Marketplace } from "@shared/schema";
import { InsertResult } from "@shared/schema";

/**
 * Base class for all scraping clients
 */
export abstract class BaseScrapingClient {
  public readonly marketplace: Marketplace;
  protected userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
  ];
  
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
   * Get a random user agent to avoid anti-scraping protections
   * @returns A random user agent string
   */
  protected getRandomUserAgent(): string {
    const randomIndex = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[randomIndex];
  }
  
  /**
   * Helper method to fetch and parse HTML content
   * @param url URL to fetch
   * @returns Promise with Cheerio object for parsing HTML
   */
  protected async fetchHtml(url: string): Promise<cheerio.CheerioAPI> {
    try {
      const headers = {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      };
      
      const response = await axios.get(url, { headers });
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }
  
  /**
   * Helper method to normalize price formats
   * @param price Price in various formats
   * @returns Normalized price string with currency
   */
  protected normalizePrice(price: string | number): string {
    if (typeof price === "number") {
      return `${price.toFixed(2)}€`;
    }
    
    // Extract numeric values and format
    let priceStr = price.trim();
    
    // Remove any non-numeric characters except decimal points
    // But keep the € symbol if present
    const hasEuroSymbol = priceStr.includes('€');
    priceStr = priceStr.replace(/[^\d.,]/g, '');
    
    // Make sure we have a properly formatted number
    priceStr = priceStr.replace(',', '.');
    
    // Add € symbol if it wasn't there
    if (!hasEuroSymbol) {
      priceStr = `${priceStr}€`;
    } else {
      priceStr = `${priceStr}€`;
    }
    
    return priceStr;
  }
  
  /**
   * Helper method to handle errors
   * @param error Error object
   */
  protected handleError(error: any): void {
    console.error(`Error in ${this.marketplace} scraping client:`, error);
  }
  
  /**
   * Apply common filters to results
   * @param results Results to filter
   * @param filters Filters to apply
   * @returns Filtered results
   */
  protected filterResults(
    results: Omit<InsertResult, "searchId" | "seen">[],
    filters?: Filter
  ): Omit<InsertResult, "searchId" | "seen">[] {
    if (!filters) {
      return results;
    }
    
    let filteredResults = [...results];
    
    // Apply price filter
    if (filters.price) {
      filteredResults = filteredResults.filter(item => {
        const itemPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        
        if (filters.price!.min !== undefined && itemPrice < filters.price!.min) {
          return false;
        }
        
        if (filters.price!.max !== undefined && itemPrice > filters.price!.max) {
          return false;
        }
        
        return true;
      });
    }
    
    // Apply condition filter
    if (filters.condition) {
      filteredResults = filteredResults.filter(item => 
        item.condition?.toLowerCase().includes(filters.condition!.toLowerCase())
      );
    }
    
    // Apply location filter
    if (filters.location?.zipCode) {
      filteredResults = filteredResults.filter(item => 
        item.location?.includes(filters.location!.zipCode!)
      );
    }
    
    // Apply sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'Price: Low to High':
        case 'Prezzo: Crescente':
          filteredResults.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
            const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
            return priceA - priceB;
          });
          break;
        case 'Price: High to Low':
        case 'Prezzo: Decrescente':
          filteredResults.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
            const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
            return priceB - priceA;
          });
          break;
        case 'Newest First':
        case 'Più recenti':
          filteredResults.sort((a, b) => 
            (b.postedAt?.getTime() || 0) - (a.postedAt?.getTime() || 0)
          );
          break;
      }
    }
    
    return filteredResults;
  }
}