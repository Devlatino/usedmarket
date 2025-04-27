import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchService } from "./services/searchService";
import { notificationService } from "./services/notificationService";
import { marketplaceService } from "./services/marketplaceService";
import { insertSearchSchema, filterSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Guest user ID for demo purposes
const GUEST_USER_ID = 1;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize guest user if it doesn't exist
  const existingUser = await storage.getUserByUsername("guest");
  if (!existingUser) {
    await storage.createUser({
      username: "guest",
      password: "guest" // In a real app, this would be properly hashed
    });
  }

  // Search endpoints
  app.post('/api/search', async (req, res) => {
    try {
      const { query, filters } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }
      
      // Validate filters if provided
      if (filters) {
        try {
          filterSchema.parse(filters);
        } catch (error) {
          if (error instanceof ZodError) {
            const validationError = fromZodError(error);
            return res.status(400).json({ message: validationError.message });
          }
          return res.status(400).json({ message: "Invalid filters" });
        }
      }
      
      // Perform search without saving
      const results = await searchService.performSearch(query, filters);
      
      res.json({
        query,
        filters,
        resultCount: results.length,
        results
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: "An error occurred while searching" });
    }
  });

  // Save search endpoint
  app.post('/api/searches', async (req, res) => {
    try {
      const { query, filters } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }
      
      // Create search
      const search = await searchService.createSearch(GUEST_USER_ID, query, filters);
      
      // Perform search and save results
      await searchService.performSearch(query, filters, search.id);
      
      res.json(search);
    } catch (error) {
      console.error('Save search error:', error);
      res.status(500).json({ message: "An error occurred while saving the search" });
    }
  });

  // Get saved searches endpoint
  app.get('/api/searches', async (req, res) => {
    try {
      const searches = await searchService.getSearches(GUEST_USER_ID);
      res.json(searches);
    } catch (error) {
      console.error('Get searches error:', error);
      res.status(500).json({ message: "An error occurred while fetching saved searches" });
    }
  });

  // Toggle search active status
  app.patch('/api/searches/:id/toggle', async (req, res) => {
    try {
      const searchId = parseInt(req.params.id);
      const { active } = req.body;
      
      if (typeof active !== 'boolean') {
        return res.status(400).json({ message: "Active status must be a boolean" });
      }
      
      const updatedSearch = await searchService.toggleSearchActive(searchId, active);
      
      if (!updatedSearch) {
        return res.status(404).json({ message: "Search not found" });
      }
      
      res.json(updatedSearch);
    } catch (error) {
      console.error('Toggle search error:', error);
      res.status(500).json({ message: "An error occurred while updating the search" });
    }
  });

  // Get search results endpoint
  app.get('/api/searches/:id/results', async (req, res) => {
    try {
      const searchId = parseInt(req.params.id);
      const results = await searchService.getSearchResults(searchId);
      res.json(results);
    } catch (error) {
      console.error('Get search results error:', error);
      res.status(500).json({ message: "An error occurred while fetching search results" });
    }
  });

  // Notification endpoints
  app.get('/api/notifications', async (req, res) => {
    try {
      const notifications = await notificationService.getNotifications(GUEST_USER_ID);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: "An error occurred while fetching notifications" });
    }
  });

  app.get('/api/notifications/unread-count', async (req, res) => {
    try {
      const count = await notificationService.getUnreadNotificationsCount(GUEST_USER_ID);
      res.json({ count });
    } catch (error) {
      console.error('Get unread notifications count error:', error);
      res.status(500).json({ message: "An error occurred while fetching unread notifications count" });
    }
  });

  app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await notificationService.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ message: "An error occurred while marking the notification as read" });
    }
  });

  app.post('/api/notifications/read-all', async (req, res) => {
    try {
      await notificationService.markAllNotificationsAsRead(GUEST_USER_ID);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ message: "An error occurred while marking all notifications as read" });
    }
  });

  // Endpoint to check for new results for saved searches
  app.post('/api/check-for-updates', async (req, res) => {
    try {
      const newNotificationsCount = await notificationService.checkForNewResults(GUEST_USER_ID);
      res.json({ 
        success: true, 
        newNotificationsCount 
      });
    } catch (error) {
      console.error('Check for updates error:', error);
      res.status(500).json({ message: "An error occurred while checking for updates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
