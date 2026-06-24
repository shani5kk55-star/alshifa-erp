import { z } from "zod";
import { createRouter, authedQuery, receptionistQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { patients, prescriptions, sales, appointments } from "@db/schema";
import { eq, like, or, desc, sql } from "drizzle-orm";

export const patientRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        search: z.string().optional(),
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
      if (input?.search) {
        conditions.push(
          or(
            like(patients.name, `%${input.search}%`),
            like(patients.phone, `%${input.search}%`),
            like(patients.patientCode, `%${input.search}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? or(...conditions) : undefined;

      const items = await db.query.patients.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(patients.createdAt)],
      });

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(patients)
        .where(whereClause);
      const total = countResult[0]?.count || 0;

      return { items, total, page, limit };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.patients.findFirst({
        where: eq(patients.id, input.id),
      });
    }),

  getByPhone: authedQuery
    .input(z.object({ phone: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.patients.findFirst({
        where: like(patients.phone, `%${input.phone}%`),
      });
    }),

  search: authedQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.patients.findMany({
        where: or(
          like(patients.name, `%${input.query}%`),
          like(patients.phone, `%${input.query}%`),
          like(patients.patientCode, `%${input.query}%`)
        ),
        limit: 10,
      });
    }),

  create: receptionistQuery
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().optional(),
        age: z.number().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        address: z.string().optional(),
        allergies: z.string().optional(),
        medicalHistory: z.string().optional(),
        medications: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(patients);
      const count = countResult[0]?.count || 0;
      const patientCode = `P-${String(count + 1).padStart(5, "0")}`;

      const [patient] = await db.insert(patients).values({
        ...input,
        patientCode,
      });

      return { ...patient, patientCode };
    }),

  update: receptionistQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        age: z.number().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        address: z.string().optional(),
        allergies: z.string().optional(),
        medicalHistory: z.string().optional(),
        medications: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(patients).set(data).where(eq(patients.id, id));
      return { success: true };
    }),

  getHistory: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const visits = await db.query.appointments.findMany({
        where: eq(appointments.patientId, input.id),
        orderBy: [desc(appointments.appointmentDate)],
      });
      const rxList = await db.query.prescriptions.findMany({
        where: eq(prescriptions.patientId, input.id),
        orderBy: [desc(prescriptions.createdAt)],
      });
      const salesList = await db.query.sales.findMany({
        where: eq(sales.patientId, input.id),
        with: { items: { with: { product: true } } },
        orderBy: [desc(sales.createdAt)],
      });
      return { visits, prescriptions: rxList, sales: salesList };
    }),
});
