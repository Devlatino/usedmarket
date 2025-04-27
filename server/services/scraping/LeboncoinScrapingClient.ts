import { Filter } from "@shared/schema";
import { InsertResult } from "@shared/schema";
import { BaseScrapingClient } from './BaseScrapingClient';
import * as cheerio from 'cheerio';

/**
 * Leboncoin.fr scraping client implementation (France)
 */
export class LeboncoinScrapingClient extends BaseScrapingClient {
  constructor() {
    super('leboncoin');
  }
  
  /**
   * Search Leboncoin.fr for items matching the query and filters
   * @param query Search query term
   * @param filters Optional filters to apply to the search
   * @returns Promise with array of results
   */
  async search(query: string, filters?: Filter): Promise<Omit<InsertResult, "searchId" | "seen">[]> {
    try {
      // Build the Leboncoin search URL
      let url = `https://www.leboncoin.fr/recherche?text=${encodeURIComponent(query)}`;
      
      // Add filters to URL if provided
      if (filters) {
        // Price filter
        if (filters.price) {
          if (filters.price.min !== undefined) {
            url += `&price=${filters.price.min}-`;
          }
          if (filters.price.max !== undefined) {
            if (filters.price.min !== undefined) {
              url += `${filters.price.max}`;
            } else {
              url += `&price=0-${filters.price.max}`;
            }
          }
        }
        
        // Sort options
        if (filters.sortBy) {
          const sortMap: Record<string, string> = {
            'Newest First': 'date-des',
            'Price: Low to High': 'price-asc',
            'Price: High to Low': 'price-des'
          };
          
          const leboncoinSort = sortMap[filters.sortBy];
          if (leboncoinSort) {
            url += `&sort=${leboncoinSort}`;
          }
        }
      }
      
      // Fetch and parse the search results page
      const $ = await this.fetchHtml(url);
      
      // Extract results from the page
      const results: Omit<InsertResult, "searchId" | "seen">[] = [];
      
      // Leboncoin search results are typically in article or div elements with specific classes
      // The actual selectors may need adjustment based on Leboncoin's current HTML structure
      $('div[data-test-id="ad-item"], article.styles_article__1CDEh').each((i, element) => {
        try {
          // Extract data from the listing
          const titleElement = $(element).find('[data-test-id="ad-title"], .styles_adTitle__2-TcA');
          const title = titleElement.text().trim();
          
          const priceElement = $(element).find('[data-test-id="ad-price"], .styles_adPrice__2CxCk');
          const priceText = priceElement.text().trim().replace(/\s+/g, '');
          
          const locationElement = $(element).find('[data-test-id="ad-location"], .styles_adLocation__1olAh');
          const locationText = locationElement.text().trim();
          
          // Get image - Leboncoin usually uses data-src or src attributes
          let imageUrl = '';
          const imgElement = $(element).find('img, [data-test-id="ad-image"]');
          if (imgElement.length > 0) {
            imageUrl = imgElement.attr('data-src') || imgElement.attr('src') || '';
          }
          
          // If no image found, try background-image in style
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
          
          // Get listing URL
          const linkElement = $(element).find('a[href^="/annonce/"]');
          const href = linkElement.attr('href') || '';
          const listingUrl = href.startsWith('http') ? href : `https://www.leboncoin.fr${href}`;
          
          // Extract date if available - Leboncoin may show relative dates
          const dateElement = $(element).find('[data-test-id="ad-date"], .styles_adDate__2tRdX');
          let postedAt = new Date();
          
          if (dateElement.length > 0) {
            const dateText = dateElement.text().trim();
            // Parse relative dates: "Hier", "Aujourd'hui", "Il y a X jours", etc.
            if (dateText.includes('Aujourd\'hui')) {
              postedAt = new Date(); // Today
            } else if (dateText.includes('Hier')) {
              // Yesterday
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              postedAt = yesterday;
            } else if (dateText.match(/Il y a (\d+) jours?/)) {
              // X days ago
              const daysAgo = parseInt(dateText.match(/Il y a (\d+) jours?/)![1]);
              const pastDate = new Date();
              pastDate.setDate(pastDate.getDate() - daysAgo);
              postedAt = pastDate;
            }
          }
          
          // Get condition if available
          const conditionElement = $(element).find('[data-test-id="ad-condition"], .styles_adCondition__3-kSW');
          const conditionText = conditionElement.text().trim() || 'Usato'; // Default to used
          
          // Create the result object
          const result: Omit<InsertResult, "searchId" | "seen"> = {
            title,
            price: this.normalizePrice(priceText),
            condition: conditionText,
            location: locationText,
            imageUrl: imageUrl || undefined,
            listingUrl,
            marketplace: 'leboncoin',
            postedAt
          };
          
          results.push(result);
        } catch (err) {
          console.error('Error parsing Leboncoin item:', err);
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