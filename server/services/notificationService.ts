import { storage } from "../storage";
import { searchService } from "./searchService";
import { Notification, InsertNotification, Search } from "@shared/schema";

export class NotificationService {
  // Create a notification for a new result
  async createNewListingNotification(
    userId: number,
    searchId: number,
    resultId: number,
    resultTitle: string,
    resultPrice: string,
    marketplace: string
  ): Promise<Notification> {
    const notification: InsertNotification = {
      userId,
      searchId,
      resultId,
      type: "new_listing",
      message: `Nuovo annuncio per "${resultTitle}" trovato su ${marketplace} a ${resultPrice}`,
      read: false
    };
    
    return await storage.createNotification(notification);
  }
  
  // Create a price drop notification
  async createPriceDropNotification(
    userId: number,
    searchId: number,
    resultId: number,
    resultTitle: string,
    oldPrice: string,
    newPrice: string
  ): Promise<Notification> {
    const notification: InsertNotification = {
      userId,
      searchId,
      resultId,
      type: "price_drop",
      message: `Prezzo ridotto per "${resultTitle}" da ${oldPrice} a ${newPrice}`,
      read: false
    };
    
    return await storage.createNotification(notification);
  }
  
  // Get all notifications for a user
  async getNotifications(userId: number): Promise<Notification[]> {
    return await storage.getNotificationsByUserId(userId);
  }
  
  // Get unread notifications count for a user
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const unreadNotifications = await storage.getUnreadNotificationsByUserId(userId);
    return unreadNotifications.length;
  }
  
  // Mark a notification as read
  async markNotificationAsRead(notificationId: number): Promise<Notification | undefined> {
    return await storage.markNotificationAsRead(notificationId);
  }
  
  // Mark all notifications as read
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await storage.markAllNotificationsAsRead(userId);
  }
  
  // Check for new results for saved searches and create notifications
  async checkForNewResults(userId: number): Promise<number> {
    // Get all active searches for the user
    const searches = await storage.getSearchesByUserId(userId);
    const activeSearches = searches.filter(search => search.active);
    
    let notificationCount = 0;
    
    for (const search of activeSearches) {
      // Get the latest results we already have for this search
      const existingResults = await storage.getResultsBySearchId(search.id);
      const existingUrls = new Set(existingResults.map(r => r.listingUrl));
      
      // Perform a new search
      const newResults = await searchService.performSearch(
        search.query, 
        search.filters as any, 
        search.id
      );
      
      // Filter out results we already have
      const genuinelyNewResults = newResults.filter(r => !existingUrls.has(r.listingUrl));
      
      // Create notifications for new results
      for (const newResult of genuinelyNewResults) {
        await this.createNewListingNotification(
          userId,
          search.id,
          newResult.id,
          newResult.title,
          newResult.price,
          newResult.marketplace
        );
        notificationCount++;
      }
    }
    
    return notificationCount;
  }
}

export const notificationService = new NotificationService();
