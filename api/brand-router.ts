import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { brands } from "@db/schema";
import { eq } from "drizzle-orm";

export const brandRouter = createRouter({
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.brands.findMany({
      orderBy: (brands, { asc }) => [asc(brands.name)],
    });
  }),

  create: adminQuery
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [brand] = await db.insert(brands).values({ name: input.name });
      return brand;
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(brands).where(eq(brands.id, input.id));
      return { success: true };
    }),
});
