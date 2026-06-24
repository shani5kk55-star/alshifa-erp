import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  bigint,
  boolean,
  date,
  time,
} from "drizzle-orm/mysql-core";

// ─── Users (Custom Auth) ───────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "receptionist", "lab_tech"]).notNull().default("receptionist"),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Patients ──────────────────────────────────────────────────
export const patients = mysqlTable("patients", {
  id: serial("id").primaryKey(),
  patientCode: varchar("patient_code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  address: text("address"),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  medications: text("medications"),
  notes: text("notes"),
  totalVisits: int("total_visits").notNull().default(0),
  lastVisit: date("last_visit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Categories ────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Brands ────────────────────────────────────────────────────
export const brands = mysqlTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Suppliers ─────────────────────────────────────────────────
export const suppliers = mysqlTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  contactPerson: varchar("contact_person", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  totalPayable: decimal("total_payable", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Products ──────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }).notNull(),
  brandId: bigint("brand_id", { mode: "number", unsigned: true }),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  color: varchar("color", { length: 50 }),
  size: varchar("size", { length: 50 }),
  frameType: mysqlEnum("frame_type", ["full_rim", "half_rim", "rimless"]),
  material: varchar("material", { length: 50 }),
  // Lens-specific
  sphMin: decimal("sph_min", { precision: 4, scale: 2 }),
  sphMax: decimal("sph_max", { precision: 4, scale: 2 }),
  cylMin: decimal("cyl_min", { precision: 4, scale: 2 }),
  cylMax: decimal("cyl_max", { precision: 4, scale: 2 }),
  axisValues: varchar("axis_values", { length: 100 }),
  addMin: decimal("add_min", { precision: 4, scale: 2 }),
  addMax: decimal("add_max", { precision: 4, scale: 2 }),
  lensType: mysqlEnum("lens_type", ["single_vision", "bifocal", "progressive"]),
  // Stock
  quantity: int("quantity").notNull().default(0),
  reorderLevel: int("reorder_level").notNull().default(10),
  reorderQty: int("reorder_qty").notNull().default(50),
  location: mysqlEnum("location", ["shop", "godown"]).notNull().default("shop"),
  // Pricing
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull().default("0"),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull().default("0"),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }),
  // Metadata
  barcode: varchar("barcode", { length: 100 }).unique(),
  imageUrl: varchar("image_url", { length: 500 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Stock Adjustments ─────────────────────────────────────────
export const stockAdjustments = mysqlTable("stock_adjustments", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["add", "subtract"]).notNull(),
  quantity: int("quantity").notNull(),
  reason: mysqlEnum("reason", ["damaged", "sample", "return", "correction", "purchase", "initial"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Appointments ──────────────────────────────────────────────
export const appointments = mysqlTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  type: mysqlEnum("type", ["eye_test", "follow_up", "frame_fitting", "lens_fitting", "delivery", "consultation"]).notNull(),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).notNull().default("scheduled"),
  notes: text("notes"),
  prescriptionId: bigint("prescription_id", { mode: "number", unsigned: true }),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Prescriptions ─────────────────────────────────────────────
export const prescriptions = mysqlTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  appointmentId: bigint("appointment_id", { mode: "number", unsigned: true }),
  prescribedBy: bigint("prescribed_by", { mode: "number", unsigned: true }),
  // Right Eye (OD)
  odSph: decimal("od_sph", { precision: 4, scale: 2 }),
  odCyl: decimal("od_cyl", { precision: 4, scale: 2 }),
  odAxis: int("od_axis"),
  odAdd: decimal("od_add", { precision: 4, scale: 2 }),
  // Left Eye (OS)
  osSph: decimal("os_sph", { precision: 4, scale: 2 }),
  osCyl: decimal("os_cyl", { precision: 4, scale: 2 }),
  osAxis: int("os_axis"),
  osAdd: decimal("os_add", { precision: 4, scale: 2 }),
  // Common
  pd: decimal("pd", { precision: 4, scale: 1 }),
  lensType: mysqlEnum("lens_type", ["single_vision", "bifocal", "progressive"]),
  remarks: text("remarks"),
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Sales ─────────────────────────────────────────────────────
export const sales = mysqlTable("sales", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 20 }).notNull().unique(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  // Financials
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discountType: mysqlEnum("discount_type", ["percentage", "fixed"]),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  grandTotal: decimal("grand_total", { precision: 12, scale: 2 }).notNull().default("0"),
  // Payment
  paymentMode: mysqlEnum("payment_mode", ["cash", "card", "online_transfer"]).notNull(),
  paymentStatus: mysqlEnum("payment_status", ["paid", "pending", "refunded"]).notNull().default("paid"),
  amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).notNull().default("0"),
  amountDue: decimal("amount_due", { precision: 12, scale: 2 }).default("0"),
  // Metadata
  notes: text("notes"),
  receiptPrinted: boolean("receipt_printed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Sale Items ────────────────────────────────────────────────
export const saleItems = mysqlTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: bigint("sale_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  prescriptionId: bigint("prescription_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Internal Use / Staff Consumption ──────────────────────────
export const internalUse = mysqlTable("internal_use", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull(),
  reason: text("reason").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Supplier Payments ─────────────────────────────────────────
export const supplierPayments = mysqlTable("supplier_payments", {
  id: serial("id").primaryKey(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMode: mysqlEnum("payment_mode", ["cash", "card", "online_transfer", "cheque"]).notNull(),
  referenceNo: varchar("reference_no", { length: 100 }),
  notes: text("notes"),
  paidBy: bigint("paid_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Export Types ──────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type StockAdjustment = typeof stockAdjustments.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Prescription = typeof prescriptions.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type SaleItem = typeof saleItems.$inferSelect;
export type InternalUse = typeof internalUse.$inferSelect;
export type SupplierPayment = typeof supplierPayments.$inferSelect;
