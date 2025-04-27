import { users, User, InsertUser, searches, Search, InsertSearch, results, Result, InsertResult, notifications, Notification, InsertNotification } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Search methods
  createSearch(search: InsertSearch): Promise<Search>;
  getSearch(id: number): Promise<Search | undefined>;
  getSearchesByUserId(userId: number): Promise<Search[]>;
  updateSearch(id: number, active: boolean): Promise<Search | undefined>;
  
  // Result methods
  createResult(result: InsertResult): Promise<Result>;
  getResult(id: number): Promise<Result | undefined>;
  getResultsBySearchId(searchId: number): Promise<Result[]>;
  getLatestResultsBySearchId(searchId: number, limit: number): Promise<Result[]>;
  markResultAsSeen(id: number): Promise<Result | undefined>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  getUnreadNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private searches: Map<number, Search>;
  private results: Map<number, Result>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number;
  private searchIdCounter: number;
  private resultIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.searches = new Map();
    this.results = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.searchIdCounter = 1;
    this.resultIdCounter = 1;
    this.notificationIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Search methods
  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = this.searchIdCounter++;
    const search: Search = { 
      ...insertSearch, 
      id, 
      createdAt: new Date() 
    };
    this.searches.set(id, search);
    return search;
  }
  
  async getSearch(id: number): Promise<Search | undefined> {
    return this.searches.get(id);
  }
  
  async getSearchesByUserId(userId: number): Promise<Search[]> {
    return Array.from(this.searches.values()).filter(
      (search) => search.userId === userId
    );
  }
  
  async updateSearch(id: number, active: boolean): Promise<Search | undefined> {
    const search = this.searches.get(id);
    if (search) {
      const updatedSearch = { ...search, active };
      this.searches.set(id, updatedSearch);
      return updatedSearch;
    }
    return undefined;
  }
  
  // Result methods
  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = this.resultIdCounter++;
    const result: Result = { 
      ...insertResult, 
      id, 
      createdAt: new Date() 
    };
    this.results.set(id, result);
    return result;
  }
  
  async getResult(id: number): Promise<Result | undefined> {
    return this.results.get(id);
  }
  
  async getResultsBySearchId(searchId: number): Promise<Result[]> {
    return Array.from(this.results.values())
      .filter(result => result.searchId === searchId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getLatestResultsBySearchId(searchId: number, limit: number): Promise<Result[]> {
    return Array.from(this.results.values())
      .filter(result => result.searchId === searchId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async markResultAsSeen(id: number): Promise<Result | undefined> {
    const result = this.results.get(id);
    if (result) {
      const updatedResult = { ...result, seen: true };
      this.results.set(id, updatedResult);
      return updatedResult;
    }
    return undefined;
  }
  
  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: new Date() 
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUnreadNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (notification) {
      const updatedNotification = { ...notification, read: true };
      this.notifications.set(id, updatedNotification);
      return updatedNotification;
    }
    return undefined;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);
    
    for (const notification of userNotifications) {
      this.notifications.set(notification.id, { ...notification, read: true });
    }
  }
}

export const storage = new MemStorage();
