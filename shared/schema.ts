import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Search schema
export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  query: text("query").notNull(),
  filters: jsonb("filters"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSearchSchema = createInsertSchema(searches).pick({
  userId: true,
  query: true,
  filters: true,
  active: true,
});

// Marketplace enum
export const marketplaceEnum = z.enum([
  // Siti internazionali
  "ebay", "amazon", "facebook", "craigslist", "etsy",
  // Siti italiani
  "subito", "kijiji", "bakeca", "idealista", "immobiliare", "autoscout24", "vinted", "rebelle",
  // Altri siti europei
  "leboncoin", "wallapop", "allegro"
]);

// Result schema
export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").references(() => searches.id),
  title: text("title").notNull(),
  price: text("price").notNull(),
  condition: text("condition"),
  location: text("location"),
  imageUrl: text("image_url"),
  listingUrl: text("listing_url").notNull(),
  marketplace: text("marketplace").notNull(),
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  seen: boolean("seen").default(false).notNull(),
});

export const insertResultSchema = createInsertSchema(results).pick({
  searchId: true,
  title: true,
  price: true,
  condition: true,
  location: true,
  imageUrl: true,
  listingUrl: true,
  marketplace: true,
  postedAt: true,
  seen: true,
});

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  searchId: integer("search_id").references(() => searches.id),
  resultId: integer("result_id").references(() => results.id),
  type: text("type").notNull(), // "new_listing", "price_drop", etc.
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  searchId: true,
  resultId: true,
  type: true,
  message: true,
  read: true,
});

// Filter schema for various filter options
export const filterSchema = z.object({
  price: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  condition: z.string().optional(),
  location: z.object({
    distance: z.number().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  sortBy: z.string().optional(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Search = typeof searches.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;

export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Filter = z.infer<typeof filterSchema>;
export type Marketplace = z.infer<typeof marketplaceEnum>;
