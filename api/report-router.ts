import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sales, saleItems, products, categories, internalUse } from "@db/schema";
import { and, gte, lte, sql, eq, desc } from "drizzle-orm";

export const reportRouter = createRouter({
  getProfitLoss: adminQuery
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      end.setHours(23, 59, 59, 999);

      // Revenue
      const revenueResult = await db
        .select({ total: sql<number>`coalesce(sum(grand_total), 0)` })
        .from(sales)
        .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)));
      const revenue = revenueResult[0]?.total || 0;

      // Cost of goods sold
      const costResult = await db
        .select({
          total: sql<number>`coalesce(sum(si.quantity * p.purchase_price), 0)`,
        })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)));
      const cost = costResult[0]?.total || 0;

      // Internal use (operational expense)
      const internalResult = await db
        .select({
          total: sql<number>`coalesce(sum(${internalUse.quantity} * p.purchase_price), 0)`,
        })
        .from(internalUse)
        .innerJoin(products, eq(internalUse.productId, products.id))
        .where(and(gte(internalUse.date, start), lte(internalUse.date, end)));
      const internalCost = internalResult[0]?.total || 0;

      const totalCost = cost + internalCost;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      // By category
      const byCategory = await db
        .select({
          category: categories.name,
          revenue: sql<number>`coalesce(sum(si.total_price), 0)`,
          cost: sql<number>`coalesce(sum(si.quantity * p.purchase_price), 0)`,
        })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)))
        .groupBy(categories.id);

      return {
        revenue,
        cost: totalCost,
        profit,
        margin: parseFloat(margin.toFixed(2)),
        byCategory,
      };
    }),

  getSalesByCategory: adminQuery
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      end.setHours(23, 59, 59, 999);

      return db
        .select({
          category: categories.name,
          sales: sql<number>`count(*)`,
          revenue: sql<number>`coalesce(sum(si.total_price), 0)`,
        })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)))
        .groupBy(categories.id);
    }),

  getTopItems: adminQuery
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      end.setHours(23, 59, 59, 999);

      return db
        .select({
          product: products.name,
          sku: products.sku,
          quantity: sql<number>`sum(si.quantity)`,
          revenue: sql<number>`coalesce(sum(si.total_price), 0)`,
        })
        .from(saleItems)
        .innerJoin(products, eq(saleItems.productId, products.id))
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)))
        .groupBy(products.id)
        .orderBy(desc(sql`sum(si.quantity)`))
        .limit(input.limit);
    }),

  getDailyReport: adminQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const date = new Date(input.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      // Sales
      const salesResult = await db
        .select({
          count: sql<number>`count(*)`,
          total: sql<number>`coalesce(sum(grand_total), 0)`,
        })
        .from(sales)
        .where(and(gte(sales.createdAt, date), lte(sales.createdAt, nextDay)));

      // By payment mode
      const byPaymentMode = await db
        .select({
          mode: sales.paymentMode,
          count: sql<number>`count(*)`,
          total: sql<number>`coalesce(sum(grand_total), 0)`,
        })
        .from(sales)
        .where(and(gte(sales.createdAt, date), lte(sales.createdAt, nextDay)))
        .groupBy(sales.paymentMode);

      return {
        sales: salesResult[0] || { count: 0, total: 0 },
        byPaymentMode,
      };
    }),
});
