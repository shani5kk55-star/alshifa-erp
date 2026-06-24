import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { suppliers, supplierPayments } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const supplierRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.suppliers.findMany({
      orderBy: [desc(suppliers.createdAt)],
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.suppliers.findFirst({
        where: eq(suppliers.id, input.id),
        with: {
          products: true,
          payments: {
            with: { paidByUser: true },
            orderBy: [desc(supplierPayments.createdAt)],
          },
        },
      });
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [supplier] = await db.insert(suppliers).values(input);
      return supplier;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(suppliers).set(data).where(eq(suppliers.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(suppliers).where(eq(suppliers.id, input.id));
      return { success: true };
    }),

  recordPayment: adminQuery
    .input(
      z.object({
        supplierId: z.number(),
        amount: z.number().positive(),
        paymentMode: z.enum(["cash", "card", "online_transfer", "cheque"]),
        referenceNo: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [payment] = await db.insert(supplierPayments).values({
        supplierId: input.supplierId,
        amount: input.amount.toFixed(2),
        paymentMode: input.paymentMode,
        referenceNo: input.referenceNo,
        notes: input.notes,
        paidBy: ctx.user.id,
      });

      // Update supplier payable
      const supplier = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, input.supplierId),
      });
      if (supplier) {
        const newPayable = Math.max(0, Number(supplier.totalPayable) - input.amount);
        await db.update(suppliers)
          .set({ totalPayable: newPayable.toFixed(2) })
          .where(eq(suppliers.id, input.supplierId));
      }

      return payment;
    }),

  getPayables: authedQuery.query(async () => {
    const db = getDb();
    return db.query.suppliers.findMany({
      where: sql`${suppliers.totalPayable} > 0`,
      orderBy: [desc(suppliers.totalPayable)],
    });
  }),
});
