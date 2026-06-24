import { relations } from "drizzle-orm";
import {
  users,
  patients,
  categories,
  brands,
  suppliers,
  products,
  stockAdjustments,
  appointments,
  prescriptions,
  sales,
  saleItems,
  internalUse,
  supplierPayments,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  sales: many(sales),
  stockAdjustments: many(stockAdjustments),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  internalUse: many(internalUse),
  supplierPayments: many(supplierPayments),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  sales: many(sales),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
  payments: many(supplierPayments),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
  saleItems: many(saleItems),
  stockAdjustments: many(stockAdjustments),
  internalUse: many(internalUse),
}));

export const stockAdjustmentsRelations = relations(stockAdjustments, ({ one }) => ({
  product: one(products, { fields: [stockAdjustments.productId], references: [products.id] }),
  user: one(users, { fields: [stockAdjustments.userId], references: [users.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  prescription: one(prescriptions, { fields: [appointments.prescriptionId], references: [prescriptions.id] }),
  creator: one(users, { fields: [appointments.createdBy], references: [users.id] }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  patient: one(patients, { fields: [prescriptions.patientId], references: [patients.id] }),
  prescriber: one(users, { fields: [prescriptions.prescribedBy], references: [users.id] }),
  appointment: one(appointments, { fields: [prescriptions.appointmentId], references: [appointments.id] }),
  saleItems: many(saleItems),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  patient: one(patients, { fields: [sales.patientId], references: [patients.id] }),
  user: one(users, { fields: [sales.userId], references: [users.id] }),
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
  prescription: one(prescriptions, { fields: [saleItems.prescriptionId], references: [prescriptions.id] }),
}));

export const internalUseRelations = relations(internalUse, ({ one }) => ({
  user: one(users, { fields: [internalUse.userId], references: [users.id] }),
  product: one(products, { fields: [internalUse.productId], references: [products.id] }),
}));

export const supplierPaymentsRelations = relations(supplierPayments, ({ one }) => ({
  supplier: one(suppliers, { fields: [supplierPayments.supplierId], references: [suppliers.id] }),
  paidByUser: one(users, { fields: [supplierPayments.paidBy], references: [users.id] }),
}));
