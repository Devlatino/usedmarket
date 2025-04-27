import { Filter } from "@shared/schema";
import { InsertResult } from "@shared/schema";
import { BaseScrapingClient } from './BaseScrapingClient';
import * as cheerio from 'cheerio';

/**
 * Wallapop scraping client implementation (Spain)
 */
export class WallapopScrapingClient extends BaseScrapingClient {
  constructor() {
    super('wallapop');
  }
  
  /**
   * Search Wallapop for items matching the query and filters
   * @param query Search query term
   * @param filters Optional filters to apply to the search
   * @returns Promise with array of results
   */
  async search(query: string, filters?: Filter): Promise<Omit<InsertResult, "searchId" | "seen">[]> {
    try {
      // Build the Wallapop search URL
      let url = `https://es.wallapop.com/search?keywords=${encodeURIComponent(query)}`;
      
      // Add filters to URL if provided
      if (filters) {
        // Price filter
        if (filters.price) {
          if (filters.price.min !== undefined) {
            url += `&min_price=${filters.price.min}`;
          }
          if (filters.price.max !== undefined) {
            url += `&max_price=${filters.price.max}`;
          }
        }
        
        // Sort options
        if (filters.sortBy) {
          const sortMap: Record<string, string> = {
            'Newest First': 'newest',
            'Price: Low to High': 'cheapest',
            'Price: High to Low': 'most_expensive'
          };
          
          const wallapopSort = sortMap[filters.sortBy];
          if (wallapopSort) {
            url += `&order_by=${wallapopSort}`;
          }
        }
      }
      
      // Fetch and parse the search results page
      const $ = await this.fetchHtml(url);
      
      // Extract results from the page
      const results: Omit<InsertResult, "searchId" | "seen">[] = [];
      
      // Wallapop search results typically in card-like elements
      $('.ItemCardList__item, .ItemCard, [data-testid="item-card"]').each((i, element) => {
        try {
          // Extract data from the listing
          const titleElement = $(element).find('.ItemCard-title, [data-testid="item-card-title"]');
          const title = titleElement.text().trim();
          
          const priceElement = $(element).find('.ItemCard-price, [data-testid="item-card-price"]');
          const priceText = priceElement.text().trim();
          
          const locationElement = $(element).find('.ItemCard-location, [data-testid="item-card-location"]');
          const locationText = locationElement.text().trim();
          
          // Get image
          let imageUrl = '';
          const imgElement = $(element).find('img.ItemCard-image, [data-testid="item-card-image"]');
          if (imgElement.length > 0) {
            imageUrl = imgElement.attr('src') || imgElement.attr('data-src') || '';
          }
          
          // If no image found, try background-image style
          if (!imageUrl) {
            const bgImgElement = $(element).find('[style*="background-image"]');
            if (bgImgElement.length > 0) {
              const bgStyle = bgImgElement.attr('style') || '';
              const match = bgStyle.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
              if (match && match[1]) {
                imageUrl = match[1];
              }
            }
          }
          
          // Remove image size parameters to get full size
          imageUrl = imageUrl.replace(/\?.*$/, '');
          
          // Get listing URL
          const linkElement = $(element).find('a.ItemCard-link, [data-testid="item-card-link"]');
          const href = linkElement.attr('href') || '';
          const listingUrl = href.startsWith('http') ? href : `https://es.wallapop.com${href}`;
          
          // Try to extract condition if available
          const conditionElement = $(element).find('.ItemCard-condition, [data-testid="item-card-condition"]');
          const conditionText = conditionElement.text().trim() || 'Usado'; // Default to used
          
          // Create the result object
          const result: Omit<InsertResult, "searchId" | "seen"> = {
            title,
            price: this.normalizePrice(priceText),
            condition: conditionText,
            location: locationText,
            imageUrl: imageUrl || undefined,
            listingUrl,
            marketplace: 'wallapop',
            postedAt: new Date() // Exact date might not be visible on search results
          };
          
          results.push(result);
        } catch (err) {
          console.error('Error parsing Wallapop item:', err);
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