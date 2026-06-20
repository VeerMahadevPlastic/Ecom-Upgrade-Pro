import { pgTable, text, serial, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const enquiriesTable = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  mobile: text("mobile").notNull(),
  businessName: text("business_name"),
  gstin: text("gstin"),
  address: text("address").notNull(),
  district: text("district"),
  pincode: text("pincode"),
  currency: text("currency").notNull().default("INR"),
  items: jsonb("items").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEnquirySchema = createInsertSchema(enquiriesTable).omit({ id: true, createdAt: true });
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type Enquiry = typeof enquiriesTable.$inferSelect;
