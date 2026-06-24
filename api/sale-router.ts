import { z } from "zod";
import { createRouter, authedQuery, receptionistQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sales, saleItems, products, prescriptions, patients } from "@db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export const saleRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        patientId: z.number().optional(),
        paymentMode: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(25),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 25;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.startDate) {
        conditions.push(gte(sales.createdAt, new Date(input.startDate)));
      }
      if (input?.endDate) {
        conditions.push(lte(sales.createdAt, new Date(input.endDate)));
      }
      if (input?.patientId) {
        conditions.push(eq(sales.patientId, input.patientId));
      }
      if (input?.paymentMode) {
        conditions.push(eq(sales.paymentMode, input.paymentMode as "cash" | "card" | "online_transfer"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.query.sales.findMany({
        where: whereClause,
        with: { patient: true, user: true },
        limit,
        offset,
        orderBy: [desc(sales.createdAt)],
      });

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(sales)
        .where(whereClause);
      const total = countResult[0]?.count || 0;

      return { items, total, page, limit };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.sales.findFirst({
        where: eq(sales.id, input.id),
        with: {
          patient: true,
          user: true,
          items: {
            with: {
              product: true,
              prescription: true,
            },
          },
        },
      });
    }),

  create: receptionistQuery
    .input(
      z.object({
        patientId: z.number().optional(),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
            unitPrice: z.number(),
            prescription: z.object({
              odSph: z.string().optional(),
              odCyl: z.string().optional(),
              odAxis: z.number().optional(),
              odAdd: z.string().optional(),
              osSph: z.string().optional(),
              osCyl: z.string().optional(),
              osAxis: z.number().optional(),
              osAdd: z.string().optional(),
              pd: z.string().optional(),
              lensType: z.enum(["single_vision", "bifocal", "progressive"]).optional(),
            }).optional(),
          })
        ),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.number().default(0),
        taxRate: z.number().default(0),
        paymentMode: z.enum(["cash", "card", "online_transfer"]),
        amountPaid: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Calculate totals
      let subtotal = 0;
      for (const item of input.items) {
        subtotal += item.unitPrice * item.quantity;
      }

      let discountAmount = 0;
      if (input.discountType === "percentage") {
        discountAmount = (subtotal * input.discountValue) / 100;
      } else if (input.discountType === "fixed") {
        discountAmount = input.discountValue;
      }

      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * input.taxRate) / 100;
      const grandTotal = afterDiscount + taxAmount;

      // Generate invoice number
      const now = new Date();
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(sales)
        .where(sql`invoice_number like ${`INV-${yearMonth}-%`}`);
      const count = (countResult[0]?.count || 0) + 1;
      const invoiceNumber = `INV-${yearMonth}-${String(count).padStart(5, "0")}`;

      // Create prescription if needed
      let prescriptionId: number | undefined;
      const rxItem = input.items.find((i) => i.prescription);
      if (rxItem?.prescription && input.patientId) {
        const [rx] = await db.insert(prescriptions).values({
          patientId: input.patientId,
          prescribedBy: ctx.user.id,
          odSph: rxItem.prescription.odSph || null,
          odCyl: rxItem.prescription.odCyl || null,
          odAxis: rxItem.prescription.odAxis || null,
          odAdd: rxItem.prescription.odAdd || null,
          osSph: rxItem.prescription.osSph || null,
          osCyl: rxItem.prescription.osCyl || null,
          osAxis: rxItem.prescription.osAxis || null,
          osAdd: rxItem.prescription.osAdd || null,
          pd: rxItem.prescription.pd || null,
          lensType: rxItem.prescription.lensType || null,
        });
        prescriptionId = rx.insertId;
      }

      // Create sale
      const [sale] = await db.insert(sales).values({
        invoiceNumber,
        patientId: input.patientId || null,
        userId: ctx.user.id,
        subtotal: subtotal.toFixed(2),
        discountType: input.discountType || null,
        discountValue: input.discountValue.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        taxRate: input.taxRate.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        paymentMode: input.paymentMode,
        paymentStatus: "paid",
        amountPaid: input.amountPaid.toFixed(2),
        amountDue: Math.max(0, grandTotal - input.amountPaid).toFixed(2),
        notes: input.notes || null,
      });

      const saleId = sale.insertId;

      // Create sale items and deduct stock
      for (const item of input.items) {
        await db.insert(saleItems).values({
          saleId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          totalPrice: (item.unitPrice * item.quantity).toFixed(2),
          prescriptionId: prescriptionId || null,
        });

        // Deduct stock
        const product = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        });
        if (product) {
          const newQty = Math.max(0, product.quantity - item.quantity);
          await db.update(products)
            .set({ quantity: newQty })
            .where(eq(products.id, item.productId));
        }
      }

      // Update patient stats
      if (input.patientId) {
        await db.update(patients)
          .set({
            lastVisit: new Date(),
            totalVisits: sql`total_visits + 1`,
          })
          .where(eq(patients.id, input.patientId));
      }

      return { saleId, invoiceNumber, grandTotal };
    }),

  getTodaySales: authedQuery.query(async () => {
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db
      .select({
        count: sql<number>`count(*)`,
        total: sql<number>`coalesce(sum(grand_total), 0)`,
      })
      .from(sales)
      .where(and(gte(sales.createdAt, today), lte(sales.createdAt, tomorrow)));

    return result[0] || { count: 0, total: 0 };
  }),

  getMonthly: authedQuery
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

      const result = await db
        .select({
          count: sql<number>`count(*)`,
          total: sql<number>`coalesce(sum(grand_total), 0)`,
        })
        .from(sales)
        .where(and(gte(sales.createdAt, startDate), lte(sales.createdAt, endDate)));

      return result[0] || { count: 0, total: 0 };
    }),
});
