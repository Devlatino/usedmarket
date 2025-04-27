import { Filter } from "@shared/schema";
import { InsertResult } from "@shared/schema";
import { BaseScrapingClient } from './BaseScrapingClient';
import * as cheerio from 'cheerio';

/**
 * Allegro scraping client implementation (Poland)
 */
export class AllegroScrapingClient extends BaseScrapingClient {
  constructor() {
    super('allegro');
  }
  
  /**
   * Search Allegro for items matching the query and filters
   * @param query Search query term
   * @param filters Optional filters to apply to the search
   * @returns Promise with array of results
   */
  async search(query: string, filters?: Filter): Promise<Omit<InsertResult, "searchId" | "seen">[]> {
    try {
      // Build the Allegro search URL
      let url = `https://allegro.pl/listing?string=${encodeURIComponent(query)}`;
      
      // Add filters to URL if provided
      if (filters) {
        // Price filter
        if (filters.price) {
          if (filters.price.min !== undefined) {
            url += `&price_from=${filters.price.min}`;
          }
          if (filters.price.max !== undefined) {
            url += `&price_to=${filters.price.max}`;
          }
        }
        
        // Used items filter
        if (filters.condition === 'Used' || filters.condition === 'Usato') {
          url += `&stan=używane`;
        } else if (filters.condition === 'New' || filters.condition === 'Nuovo') {
          url += `&stan=nowe`;
        }
        
        // Sort options
        if (filters.sortBy) {
          const sortMap: Record<string, string> = {
            'Newest First': 'qd',
            'Price: Low to High': 'p',
            'Price: High to Low': 'pd',
            'Ending Soon': 'ek'
          };
          
          const allegroSort = sortMap[filters.sortBy];
          if (allegroSort) {
            url += `&order=${allegroSort}`;
          }
        }
      }
      
      // Fetch and parse the search results page
      const $ = await this.fetchHtml(url);
      
      // Extract results from the page
      const results: Omit<InsertResult, "searchId" | "seen">[] = [];
      
      // Allegro search results typically in article or div elements
      $('article[data-role="offer"], div[data-box-name="listings-grid"] > div').each((i, element) => {
        try {
          // Extract data from the listing
          const titleElement = $(element).find('h2[data-role="offer-title"], [data-box-name="title"]');
          const title = titleElement.text().trim();
          
          // Skip if no title (might be an ad or something else)
          if (!title) return;
          
          const priceElement = $(element).find('[data-role="price"], [data-box-name="price"]');
          const priceText = priceElement.text().trim().replace(/\s+/g, '');
          
          const locationElement = $(element).find('[data-box-name="location"]');
          const locationText = locationElement.text().trim();
          
          // Get image
          let imageUrl = '';
          const imgElement = $(element).find('img[data-role="offer-photo"], [data-box-name="image"] img');
          if (imgElement.length > 0) {
            imageUrl = imgElement.attr('src') || imgElement.attr('data-src') || '';
          }
          
          // If data-src has a placeholder or lazy loading pattern, try to get the full URL
          if (imageUrl.includes('data:image') || !imageUrl) {
            imageUrl = imgElement.attr('data-src') || '';
          }
          
          // Remove image size parameters if present
          imageUrl = imageUrl.replace(/;s=\d+x\d+/, '');
          
          // Get listing URL
          const linkElement = $(element).find('a[href*="/oferta/"]');
          const href = linkElement.attr('href') || '';
          const listingUrl = href.startsWith('http') ? href : `https://allegro.pl${href}`;
          
          // Get condition if available
          const conditionElement = $(element).find('[data-box-name="condition"]');
          const conditionText = conditionElement.text().trim() || 'Używane'; // Default to used
          
          // Create the result object
          const result: Omit<InsertResult, "searchId" | "seen"> = {
            title,
            price: this.normalizePrice(priceText),
            condition: conditionText,
            location: locationText,
            imageUrl: imageUrl || undefined,
            listingUrl,
            marketplace: 'allegro',
            postedAt: new Date() // Exact date might not be visible on search results
          };
          
          results.push(result);
        } catch (err) {
          console.error('Error parsing Allegro item:', err);
        }
      });
      
      // Apply any additional filtering that couldn't be done in the URL
      return this.filterResults(results, filters);
    } catch (error) {
      this.handleError(error);
      // Return an empty array in case of error
      return [];
    }
  }
}