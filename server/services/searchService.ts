import { storage } from "../storage";
import { marketplaceService } from "./marketplaceService";
import { Search, InsertSearch, Result, InsertResult, Filter } from "@shared/schema";

export class SearchService {
  async createSearch(userId: number, query: string, filters?: Filter): Promise<Search> {
    const search: InsertSearch = {
      userId,
      query,
      filters: filters || {},
      active: true
    };
    
    return await storage.createSearch(search);
  }
  
  async getSearches(userId: number): Promise<Search[]> {
    return await storage.getSearchesByUserId(userId);
  }
  
  async toggleSearchActive(searchId: number, active: boolean): Promise<Search | undefined> {
    return await storage.updateSearch(searchId, active);
  }
  
  async performSearch(query: string, filters?: Filter, searchId?: number): Promise<Result[]> {
    // Search across marketplaces
    const rawResults = await marketplaceService.searchAllMarketplaces(query, filters);
    const results: Result[] = [];
    
    // If searchId is provided, save results to the database
    if (searchId) {
      for (const rawResult of rawResults) {
        const resultToInsert: InsertResult = {
          ...rawResult,
          searchId,
          seen: false
        };
        
        const result = await storage.createResult(resultToInsert);
        results.push(result);
      }
    } else {
      // If no searchId, don't save results but convert to Result type
      for (const rawResult of rawResults) {
        const result = {
          ...rawResult,
          id: -1, // Temporary ID, not stored
          searchId: -1, // Temporary ID, not stored
          seen: false,
          createdAt: new Date()
        } as Result;
        
        results.push(result);
      }
    }
    
    return results;
  }
  
  async getSearchResults(searchId: number): Promise<Result[]> {
    return await storage.getResultsBySearchId(searchId);
  }
}

export const searchService = new SearchService();
