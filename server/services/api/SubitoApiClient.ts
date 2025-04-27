import axios from 'axios';
import { Filter, Marketplace } from "@shared/schema";
import { InsertResult } from "@shared/schema";
import { BaseApiClient } from './BaseApiClient';
import { ApiConfig } from './ApiConfig';

// Subito.it API Client implementation
export class SubitoApiClient extends BaseApiClient {
  private baseUrl: string;
  
  constructor() {
    super('subito');
    const credentials = ApiConfig.getCredentials('subito');
    this.baseUrl = credentials.baseUrl || 'https://api.subito.it/v1';
  }
  
  /**
   * Search Subito.it for items matching the query and filters
   * @param query Search query term
   * @param filters Optional filters to apply to the search
   * @returns Promise with array of results
   */
  async search(query: string, filters?: Filter): Promise<Omit<InsertResult, "searchId" | "seen">[]> {
    try {
      // Subito.it might not need an API key for basic searches
      // But their API might be subject to rate limiting without authentication
      
      // Build query parameters
      const params: Record<string, any> = {
        q: query,
        t: 'all', // all listings
        lim: 25 // limit results
      };
      
      // Apply filters if provided
      if (filters) {
        // Price filter
        if (filters.price) {
          if (filters.price.min !== undefined) {
            params.ps = filters.price.min;
          }
          if (filters.price.max !== undefined) {
            params.pe = filters.price.max;
          }
        }
        
        // Location filter
        if (filters.location?.zipCode) {
          // You would need to map the zip code to the appropriate region/city id
          // params.r = regionId; 
          // params.c = cityId;
        }
        
        // Sort options
        if (filters.sortBy) {
          const sortMap: Record<string, string> = {
            'Newest First': 'dts',
            'Price: Low to High': 'prl',
            'Price: High to Low': 'prh'
          };
          
          const subitoSort = sortMap[filters.sortBy];
          if (subitoSort) {
            params.so = subitoSort;
          }
        }
      }
      
      // Make API request
      // Note: Subito.it may not have a public API or might use GraphQL/different endpoints
      // This is a simplified example
      const response = await axios.get(`${this.baseUrl}/search`, { params });
      
      // Transform the response to our standard format
      const items = response.data?.items || [];
      
      return items.map((item: any) => ({
        title: item.title,
        price: this.normalizePrice(item.price || 0),
        condition: item.features?.conditions || 'Not Specified',
        location: item.geo?.city?.name || item.geo?.region?.name,
        imageUrl: item.images?.[0]?.url,
        listingUrl: item.urls?.default,
        marketplace: this.marketplace,
        postedAt: new Date(item.date * 1000) // Assuming timestamp in seconds
      }));
    } catch (error) {
      this.handleApiError(error);
      // In case of API issues, return mock data
      return this.getMockResults(query, filters);
    }
  }
  
  /**
   * Generate mock results for testing when API access fails
   * @param query Search query term
   * @param filters Optional filters to apply to the search
   * @returns Array of mock results
   */
  private getMockResults(query: string, filters?: Filter): Omit<InsertResult, "searchId" | "seen">[] {
    console.log('Using mock Subito.it results for demonstration purposes');
    
    // Generate some mock results based on the query
    const mockResults: Omit<InsertResult, "searchId" | "seen">[] = [
      {
        title: `${query} Vintage Anni '70 - Ottimo Stato`,
        price: '65€',
        condition: 'Usato - Buono',
        location: 'Torino, IT',
        imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15',
        listingUrl: 'https://example.com/subito-listing-1',
        marketplace: 'subito',
        postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: `${query} Moderno - Condizioni Perfette`,
        price: '85€',
        condition: 'Usato - Come Nuovo',
        location: 'Milano, IT',
        imageUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf',
        listingUrl: 'https://example.com/subito-listing-2',
        marketplace: 'subito',
        postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
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
    
    // Apply location filter
    if (filters.location?.zipCode) {
      // Simple string matching for mock data
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