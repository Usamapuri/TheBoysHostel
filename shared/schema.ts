import { pgTable, text, serial, integer, boolean, timestamp, uuid, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["tenant", "cafe_manager", "hostel_team", "hostel_admin"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "accepted", "preparing", "ready", "delivered", "cancelled", "deleted"]);
export const bookingStatusEnum = pgEnum("booking_status", ["confirmed", "cancelled", "completed"]);
export const siteEnum = pgEnum("site", ["blue_area", "i_10", "both"]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull(),
  site: siteEnum("site").notNull().default("blue_area"),
  room_type: text("room_type").default("shared_room"), // Room selection (shared_room, private_room)
  room_number: text("room_number"), // Room/bed number
  credits: integer("credits").default(30),
  used_credits: decimal("used_credits", { precision: 10, scale: 2 }).default("0"),
  is_active: boolean("is_active").default(true),
  start_date: timestamp("start_date").defaultNow(),
  bio: text("bio"),
  linkedin_url: text("linkedin_url"),
  profile_image: text("profile_image"),
  job_title: text("job_title"),
  company: text("company"),
  community_visible: boolean("community_visible").default(true),
  email_visible: boolean("email_visible").default(false),
  onboarding_completed: boolean("onboarding_completed").default(false),
  rfid_number: text("rfid_number"),
  // Password reset fields
  password_reset_token: text("password_reset_token"),
  password_reset_expires: timestamp("password_reset_expires"),
  created_at: timestamp("created_at").defaultNow(),
});

// Menu Categories
export const menu_categories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  display_order: integer("display_order").default(0),
  is_active: boolean("is_active").default(true),
  site: siteEnum("site").notNull().default("blue_area"),
});

// Menu Items
export const menu_items = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category_id: integer("category_id").references(() => menu_categories.id),
  image_url: text("image_url"),
  is_available: boolean("is_available").default(true),
  is_daily_special: boolean("is_daily_special").default(false),
  site: siteEnum("site").notNull().default("blue_area"),
  created_at: timestamp("created_at").defaultNow(),
});

// Cafe Orders
export const cafe_orders = pgTable("cafe_orders", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending"),
  handled_by: integer("handled_by").references(() => users.id),
  created_by: integer("created_by").references(() => users.id), // For cafe manager created orders
  payment_status: text("payment_status").default("unpaid"), // paid/unpaid
  payment_updated_by: integer("payment_updated_by").references(() => users.id),
  payment_updated_at: timestamp("payment_updated_at"),
  notes: text("notes"),
  delivery_location: text("delivery_location"),
  site: siteEnum("site").notNull().default("blue_area"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Cafe Order Items
export const cafe_order_items = pgTable("cafe_order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => cafe_orders.id).notNull(),
  menu_item_id: integer("menu_item_id").references(() => menu_items.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Common Rooms
export const common_rooms = pgTable("common_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  capacity: integer("capacity").notNull(),
  credit_cost_per_hour: integer("credit_cost_per_hour").notNull(),
  amenities: text("amenities").array(),
  image_url: text("image_url"),
  is_available: boolean("is_available").default(true),
  site: siteEnum("site").notNull().default("blue_area"),
  created_at: timestamp("created_at").defaultNow(),
});

// Common Room Bookings
export const common_room_bookings = pgTable("common_room_bookings", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  room_id: integer("room_id").references(() => common_rooms.id).notNull(),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
  credits_used: decimal("credits_used", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").default("confirmed"),
  notes: text("notes"),
  cancelled_by: integer("cancelled_by").references(() => users.id), // Admin/team user who cancelled the booking
  site: siteEnum("site").notNull().default("blue_area"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Announcements
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  image_url: text("image_url"),
  show_until: timestamp("show_until"),
  is_active: boolean("is_active").default(true),
  site: siteEnum("site").notNull().default("blue_area"), // Keep for backwards compatibility
  sites: text("sites").array().default(["blue_area"]), // New array field for multiple sites
  created_at: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true });

// Create update schema for users (for partial updates)
export const updateUserSchema = createInsertSchema(users)
  .omit({ id: true, created_at: true })
  .partial(); // Make all fields optional for updates
export const insertMenuCategorySchema = createInsertSchema(menu_categories).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menu_items).omit({ id: true, created_at: true });
export const insertCafeOrderSchema = createInsertSchema(cafe_orders).omit({ id: true, created_at: true, updated_at: true });
export const insertCafeOrderItemSchema = createInsertSchema(cafe_order_items).omit({ id: true });
export const insertCommonRoomSchema = createInsertSchema(common_rooms).omit({ id: true, created_at: true });
export const insertCommonRoomBookingSchema = createInsertSchema(common_room_bookings).omit({ id: true, created_at: true, updated_at: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, created_at: true }).extend({
  sites: z.array(z.string()).optional(), // Add sites field as optional array of strings
  show_until: z.string().optional().nullable().or(z.date().optional().nullable()) // Accept string or date format
});

// Types
export type User = typeof users.$inferSelect;
export type MenuCategory = typeof menu_categories.$inferSelect;
export type MenuItem = typeof menu_items.$inferSelect;
export type CafeOrder = typeof cafe_orders.$inferSelect;
export type CafeOrderItem = typeof cafe_order_items.$inferSelect;
export type CommonRoom = typeof common_rooms.$inferSelect;
export type CommonRoomBooking = typeof common_room_bookings.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertCafeOrder = z.infer<typeof insertCafeOrderSchema>;
export type InsertCafeOrderItem = z.infer<typeof insertCafeOrderItemSchema>;
export type InsertCommonRoom = z.infer<typeof insertCommonRoomSchema>;
export type InsertCommonRoomBooking = z.infer<typeof insertCommonRoomBookingSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;
