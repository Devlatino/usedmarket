import axios from 'axios';
import { Filter, Marketplace } from "@shared/schema";
import { InsertResult } from "@shared/schema";
import { BaseApiClient } from './BaseApiClient';
import { ApiConfig } from './ApiConfig';

// eBay API Client implementation
export class EbayApiClient extends BaseApiClient {
  private apiKey: string | undefined;
  private appId: string | undefined;
  private baseUrl: string;
  
  constructor() {
    super('ebay');
    const credentials = ApiConfig.getCredentials('ebay');
    this.apiKey = credentials.apiKey;
    this.appId = credentials.appId;
    this.baseUrl = credentials.baseUrl || 'https://api.ebay.com/buy/browse/v1';
  }
  
  /**
   * Search eBay for items matching the query and filters
   * @param query Search query term
   * @param filters Optional filters to apply to the search
   * @returns Promise with array of results
   */
  async search(query: string, filters?: Filter): Promise<Omit<InsertResult, "searchId" | "seen">[]> {
    try {
      // Check if we have the required API credentials
      if (!this.apiKey) {
        console.log('eBay API key is missing, returning mock data');
        return this.getMockResults(query, filters);
      }
      
      // Build query parameters for the eBay API
      const params = new URLSearchParams();
      params.append('q', query);
      
      // Apply filters if provided
      if (filters) {
        // Price filter
        if (filters.price) {
          if (filters.price.min !== undefined) {
            params.append('price_min', filters.price.min.toString());
          }
          if (filters.price.max !== undefined) {
            params.append('price_max', filters.price.max.toString());
          }
        }
        
        // Condition filter mapping
        if (filters.condition) {
          const conditionMap: Record<string, string> = {
            'New': 'NEW',
            'Used': 'USED',
            'Like New': 'LIKE_NEW',
            'Refurbished': 'REFURBISHED'
          };
          
          const ebayCondition = conditionMap[filters.condition];
          if (ebayCondition) {
            params.append('itemCondition', ebayCondition);
          }
        }
        
        // Sort options
        if (filters.sortBy) {
          const sortMap: Record<string, string> = {
            'Best Match': 'relevance',
            'Price: Low to High': 'price_asc',
            'Price: High to Low': 'price_desc',
            'Newest First': 'newly_listed'
          };
          
          const ebaySort = sortMap[filters.sortBy];
          if (ebaySort) {
            params.append('sort', ebaySort);
          }
        }
      }
      
      // Make the API request
      const response = await axios.get(`${this.baseUrl}/browse/search`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_IT'
        }
      });
      
      // Transform the response to our standard format
      const items = response.data.items || [];
      
      return items.map((item: any) => ({
        title: item.title,
        price: this.normalizePrice(item.price?.value || 0),
        condition: item.condition,
        location: item.itemLocation?.country,
        imageUrl: item.image?.imageUrl,
        listingUrl: item.itemWebUrl,
        marketplace: this.marketplace,
        postedAt: new Date(item.itemCreationDate || Date.now())
      }));
    } catch (error) {
      this.handleApiError(error);
      // Return mock data as fallback
      return this.getMockResults(query, filters);
    }
  }
  
  /**
   * Generate mock results for testing when API credentials are not available
   * @param query Search query term
   * @param filters Optional filters to apply to the search
   * @returns Array of mock results
   */
  private getMockResults(query: string, filters?: Filter): Omit<InsertResult, "searchId" | "seen">[] {
    // This should only be used when API credentials are not available
    // In a production app, we would handle this differently or require API credentials
    console.log('Using mock eBay results for demonstration purposes');
    
    // Generate some mock results based on the query
    const mockResults: Omit<InsertResult, "searchId" | "seen">[] = [
      {
        title: `${query} Vintage Style - Excellent Condition`,
        price: '75€',
        condition: 'Used - Good',
        location: 'Milan, IT',
        imageUrl: 'https://images.unsplash.com/photo-1609799545166-347a5ba518cf',
        listingUrl: 'https://example.com/ebay-listing-1',
        marketplace: 'ebay',
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: `Antique ${query} - Collector's Item`,
        price: '125€',
        condition: 'Used - Very Good',
        location: 'Rome, IT',
        imageUrl: 'https://images.unsplash.com/photo-1589394693989-58f2525ebe95',
        listingUrl: 'https://example.com/ebay-listing-2',
        marketplace: 'ebay',
        postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      }
    ];
    
    // Apply filters to mock results if provided
    if (filters) {
      return this.filterMockResults(mockResults, filters);
    }
    
    return mockResults;
  }
  
  /**
   * Apply filters to mock results
   * @param results Mock results to filter
   * @param filters Filters to apply
   * @returns Filtered results
   */
  private filterMockResults(
    results: Omit<InsertResult, "searchId" | "seen">[],
    filters: Filter
  ): Omit<InsertResult, "searchId" | "seen">[] {
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
    
    // Apply sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'Price: Low to High':
          filteredResults.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
            const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
            return priceA - priceB;
          });
          break;
        case 'Price: High to Low':
          filteredResults.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
            const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
            return priceB - priceA;
          });
          break;
        case 'Newest First':
          filteredResults.sort((a, b) => 
            (b.postedAt?.getTime() || 0) - (a.postedAt?.getTime() || 0)
          );
          break;
      }
    }
    
    return filteredResults;
  }
}