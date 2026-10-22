import { pgTable, serial, text, timestamp, integer, doublePrecision, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  name: text().notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text().notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  token: text().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const properties = pgTable("properties", {
  id: serial().primaryKey(),
  reference: text().notNull().default(""),
  title: text().notNull(),
  description: text().notNull().default(""),
  operation: text().notNull().default("buy"),
  propertyType: text("property_type").notNull().default("apartment"),
  price: doublePrecision().notNull().default(0),
  city: text().notNull().default(""),
  zone: text().notNull().default(""),
  address: text().notNull().default(""),
  bedrooms: integer().notNull().default(0),
  bathrooms: integer().notNull().default(0),
  area: doublePrecision().notNull().default(0),
  energyCertificate: text("energy_certificate").notNull().default(""),
  features: jsonb().$type<string[]>().notNull().default([]),
  images: jsonb().$type<string[]>().notNull().default([]),
  videos: jsonb().$type<string[]>().notNull().default([]),
  featured: boolean().notNull().default(false),
  status: text().notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
