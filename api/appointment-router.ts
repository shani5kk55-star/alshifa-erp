import { z } from "zod";
import { createRouter, authedQuery, receptionistQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { appointments } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

export const appointmentRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        date: z.string().optional(),
        month: z.number().optional(),
        year: z.number().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.date) {
        conditions.push(eq(appointments.appointmentDate, new Date(input.date)));
      }
      if (input?.status) {
        conditions.push(eq(appointments.status, input.status as "scheduled" | "in_progress" | "completed" | "cancelled"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return db.query.appointments.findMany({
        where: whereClause,
        with: { patient: true },
        orderBy: [asc(appointments.appointmentDate), asc(appointments.appointmentTime)],
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.appointments.findFirst({
        where: eq(appointments.id, input.id),
        with: { patient: true },
      });
    }),

  getByDate: authedQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.appointments.findMany({
        where: eq(appointments.appointmentDate, new Date(input.date)),
        with: { patient: true },
        orderBy: [asc(appointments.appointmentTime)],
      });
    }),

  create: receptionistQuery
    .input(
      z.object({
        patientId: z.number(),
        date: z.string(),
        time: z.string(),
        type: z.enum(["eye_test", "follow_up", "frame_fitting", "lens_fitting", "delivery", "consultation"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [appointment] = await db.insert(appointments).values({
        patientId: input.patientId,
        appointmentDate: new Date(input.date),
        appointmentTime: input.time,
        type: input.type,
        notes: input.notes,
        createdBy: ctx.user.id,
      });
      return appointment;
    }),

  update: receptionistQuery
    .input(
      z.object({
        id: z.number(),
        date: z.string().optional(),
        time: z.string().optional(),
        type: z.enum(["eye_test", "follow_up", "frame_fitting", "lens_fitting", "delivery", "consultation"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(appointments).set({
        ...data,
        appointmentDate: data.date ? new Date(data.date) : undefined,
        appointmentTime: data.time || undefined,
      }).where(eq(appointments.id, id));
      return { success: true };
    }),

  updateStatus: receptionistQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(appointments)
        .set({ status: input.status })
        .where(eq(appointments.id, input.id));
      return { success: true };
    }),

  delete: receptionistQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(appointments).where(eq(appointments.id, input.id));
      return { success: true };
    }),
});
