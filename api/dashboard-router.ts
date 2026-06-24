import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sales, patients, products, appointments, saleItems } from "@db/schema";
import { and, gte, lte, sql, desc, eq } from "drizzle-orm";

export const dashboardRouter = createRouter({
  getStats: authedQuery.query(async () => {
    const db = getDb();

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await db
      .select({
        count: sql<number>`count(*)`,
        total: sql<number>`coalesce(sum(grand_total), 0)`,
      })
      .from(sales)
      .where(and(gte(sales.createdAt, today), lte(sales.createdAt, tomorrow)));

    // Total patients
    const totalPatients = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients);

    // Patients registered today
    const newPatients = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(and(gte(patients.createdAt, today), lte(patients.createdAt, tomorrow)));

    // Low stock items
    const lowStock = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(sql`${products.quantity} <= ${products.reorderLevel} and ${products.quantity} > 0`);

    // Out of stock
    const outOfStock = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.quantity, 0));

    // Pending appointments
    const pendingAppointments = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.appointmentDate, today),
          eq(appointments.status, "scheduled")
        )
      );

    // Monthly sales (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySales = await db
      .select({
        month: sql<string>`date_format(created_at, '%Y-%m')`,
        total: sql<number>`coalesce(sum(grand_total), 0)`,
      })
      .from(sales)
      .where(gte(sales.createdAt, sixMonthsAgo))
      .groupBy(sql`date_format(created_at, '%Y-%m')`)
      .orderBy(sql`date_format(created_at, '%Y-%m')`);

    // Top selling items (this month)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const topItems = await db
      .select({
        productId: saleItems.productId,
        name: products.name,
        quantity: sql<number>`sum(${saleItems.quantity})`,
        revenue: sql<number>`coalesce(sum(${saleItems.totalPrice}), 0)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(gte(sales.createdAt, monthStart))
      .groupBy(saleItems.productId)
      .orderBy(desc(sql`sum(${saleItems.quantity})`))
      .limit(5);

    return {
      todaySales: todaySales[0]?.total || 0,
      todaySalesCount: todaySales[0]?.count || 0,
      totalPatients: totalPatients[0]?.count || 0,
      newPatientsToday: newPatients[0]?.count || 0,
      lowStockCount: lowStock[0]?.count || 0,
      outOfStockCount: outOfStock[0]?.count || 0,
      pendingAppointments: pendingAppointments[0]?.count || 0,
      monthlySales,
      topItems,
    };
  }),

  getSalesChart: authedQuery
    .input(
      z.object({
        period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const now = new Date();
      let startDate: Date;
      let groupFormat: string;

      if (input.period === "daily") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 14);
        groupFormat = "%Y-%m-%d";
      } else if (input.period === "weekly") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 70);
        groupFormat = "%Y-%u";
      } else {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 12);
        groupFormat = "%Y-%m";
      }

      startDate.setHours(0, 0, 0, 0);

      const data = await db
        .select({
          label: sql<string>`date_format(created_at, ${groupFormat})`,
          total: sql<number>`coalesce(sum(grand_total), 0)`,
        })
        .from(sales)
        .where(gte(sales.createdAt, startDate))
        .groupBy(sql`date_format(created_at, ${groupFormat})`)
        .orderBy(sql`date_format(created_at, ${groupFormat})`);

      return { labels: data.map((d) => d.label), data: data.map((d) => d.total) };
    }),

  getRecentSales: authedQuery
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.sales.findMany({
        with: { patient: true },
        orderBy: [desc(sales.createdAt)],
        limit: input.limit,
      });
    }),

  getActivities: authedQuery
    .query(async () => {
      const db = getDb();

      const recentSales = await db.query.sales.findMany({
        with: { patient: true, user: true },
        orderBy: [desc(sales.createdAt)],
        limit: 5,
      });

      const recentPatients = await db.query.patients.findMany({
        orderBy: [desc(patients.createdAt)],
        limit: 5,
      });

      const stockAlerts = await db.query.products.findMany({
        where: sql`${products.quantity} <= ${products.reorderLevel}`,
        orderBy: [sql`${products.quantity} asc`],
        limit: 5,
      });

      return {
        recentSales,
        recentPatients,
        stockAlerts,
      };
    }),
});
