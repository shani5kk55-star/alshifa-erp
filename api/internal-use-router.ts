import { z } from "zod";
import { createRouter, authedQuery, adminQuery, labTechQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { internalUse, products } from "@db/schema";
import { eq, gte, lte, desc, sql, and } from "drizzle-orm";

export const internalUseRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        userId: z.number().optional(),
        date: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.userId) {
        conditions.push(eq(internalUse.userId, input.userId));
      }
      if (input?.date) {
        conditions.push(eq(internalUse.date, new Date(input.date)));
      }

      if (conditions.length > 0) {
        return db.query.internalUse.findMany({
          where: and(...conditions),
          with: { user: true, product: true },
          orderBy: [desc(internalUse.createdAt)],
          limit: 200,
        });
      }

      return db.query.internalUse.findMany({
        with: { user: true, product: true },
        orderBy: [desc(internalUse.createdAt)],
        limit: 200,
      });
    }),

  create: labTechQuery
    .input(
      z.object({
        userId: z.number(),
        productId: z.number(),
        quantity: z.number().min(1),
        reason: z.string().min(1),
        date: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check product stock
      const product = await db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.quantity < input.quantity) {
        throw new Error("Insufficient stock");
      }

      // Deduct stock
      await db.update(products)
        .set({ quantity: product.quantity - input.quantity })
        .where(eq(products.id, input.productId));

      // Record internal use
      const [record] = await db.insert(internalUse).values({
        userId: input.userId,
        productId: input.productId,
        quantity: input.quantity,
        reason: input.reason,
        date: input.date ? new Date(input.date) : new Date(),
      });

      return record;
    }),

  getSummary: adminQuery
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

      const totalItems = await db
        .select({
          total: sql<number>`coalesce(sum(quantity), 0)`,
          totalCost: sql<number>`coalesce(sum(${internalUse.quantity} * p.purchase_price), 0)`,
        })
        .from(internalUse)
        .innerJoin(products, eq(internalUse.productId, products.id))
        .where(and(gte(internalUse.date, start), lte(internalUse.date, end)));

      const byUser = await db
        .select({
          userId: internalUse.userId,
          totalItems: sql<number>`sum(quantity)`,
          totalCost: sql<number>`coalesce(sum(${internalUse.quantity} * p.purchase_price), 0)`,
        })
        .from(internalUse)
        .innerJoin(products, eq(internalUse.productId, products.id))
        .where(and(gte(internalUse.date, start), lte(internalUse.date, end)))
        .groupBy(internalUse.userId);

      return {
        totalItems: totalItems[0]?.total || 0,
        totalCost: totalItems[0]?.totalCost || 0,
        byUser,
      };
    }),
});
